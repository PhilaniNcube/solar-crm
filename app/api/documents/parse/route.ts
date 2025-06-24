import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// Equipment schema matching the frontend form
const equipmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(
    [
      "Solar Panel",
      "Inverter",
      "Battery",
      "Mounting System",
      "Electrical",
      "Tools",
      "Other",
    ],
    { required_error: "Category is required" }
  ),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive").default(0),
  specifications: z
    .array(
      z.object({
        key: z.string().min(1, "Specification name is required"),
        value: z.string().min(1, "Specification value is required"),
      })
    )
    .optional(),
  warrantyPeriod: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Response schema for the API
const parseResponseSchema = z.object({
  success: z.boolean(),
  equipment: equipmentSchema.optional(),
  error: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

type EquipmentData = z.infer<typeof equipmentSchema>;
type ParseResponse = z.infer<typeof parseResponseSchema>;

export async function POST(
  request: NextRequest
): Promise<NextResponse<ParseResponse>> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    } // Parse the JSON body
    const body = await request.json();
    const { documentUrl } = body;
    console.log("Received document URL:", documentUrl); // Log the URL for debugging

    if (!documentUrl) {
      return NextResponse.json(
        { success: false, error: "No document URL provided" },
        { status: 400 }
      );
    }

    // Basic URL validation - we'll validate the actual content when we fetch it
    try {
      new URL(documentUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid document URL provided" },
        { status: 400 }
      );
    } // Extract text from PDF using LangChain
    let pdfText: string;
    try {
      // Fetch the PDF from the URL
      const response = await fetch(documentUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }

      // Validate content type if available
      const contentType = response.headers.get("content-type");
      if (
        contentType &&
        !contentType.includes("application/pdf") &&
        !contentType.includes("pdf")
      ) {
        console.warn(
          `Unexpected content type: ${contentType}, but proceeding with PDF parsing`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Validate that this looks like a PDF by checking the header
      const pdfHeader = buffer.subarray(0, 4).toString();
      if (!pdfHeader.includes("%PDF")) {
        throw new Error("File does not appear to be a valid PDF document");
      }

      // Create a blob to use with PDFLoader
      const blob = new Blob([buffer], { type: "application/pdf" });
      const loader = new PDFLoader(blob, {
        splitPages: false, // We want all text together
        parsedItemSeparator: " ", // Separate items with spaces
      });

      // Load and parse the PDF
      const documents = await loader.load();

      // Combine text from all documents
      pdfText = documents
        .map((doc) => doc.pageContent)
        .join("\n")
        .trim();

      console.log("Extracted PDF text:", pdfText.substring(0, 1000)); // Log first 1000 characters for debugging
    } catch (error) {
      console.error("PDF parsing error:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to extract text from PDF. Please ensure the document is a valid PDF and not password-protected or corrupted.",
        },
        { status: 400 }
      );
    }

    // Validate that we extracted meaningful content
    if (!pdfText.trim() || pdfText.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: "PDF appears to be empty or contains insufficient text",
        },
        { status: 400 }
      );
    } // Use AI to extract structured equipment data
    const result = await generateObject({
      model: google("gemini-2.5-flash-preview-04-17"),
      schema: z.object({
        equipment: equipmentSchema,
        confidence: z
          .number()
          .min(0)
          .max(1)
          .describe("Confidence level of the extraction (0-1)"),
        reasoning: z
          .string()
          .describe("Brief explanation of how the data was extracted"),
      }),
      prompt: `
        You are an expert at extracting equipment specifications from technical datasheets.
        
        Please analyze the following PDF text content and extract structured equipment information:
        
        ${pdfText.substring(0, 8000)} ${
        pdfText.length > 8000 ? "...(truncated)" : ""
      }        Instructions:
        1. Identify the product name, manufacturer, and model
        2. Determine the appropriate category from the available options
        3. Extract key specifications as key-value pairs (e.g., "Power Output": "400W", "Efficiency": "21.5%")
        4. Look for warranty information
        5. Extract price as a number (e.g., 299.99), use 0 if not found
        6. Provide a brief description of the product
        
        Guidelines:
        - Be as accurate as possible
        - If information is unclear, make reasonable inferences
        - Always set isActive to true
        - Use "Other" category only if no other category fits
        - For specifications, include the most important technical details
        - Format specifications clearly (e.g., "Maximum Power" instead of "Pmax")
        - Price must be a number (not a string), use 0 if no price information is available
        - Ensure all required fields are populated with valid values
        
        Categories available:
        - Solar Panel: Photovoltaic panels, modules
        - Inverter: String inverters, microinverters, power optimizers
        - Battery: Energy storage systems, battery packs
        - Mounting System: Racking, rails, clamps
        - Electrical: Cables, connectors, junction boxes, monitoring
        - Tools: Installation tools, testing equipment
        - Other: Any equipment that doesn't fit above categories
      `,
    }); // Validate the extracted data
    const validatedEquipment = equipmentSchema.safeParse(
      result.object.equipment
    );

    if (!validatedEquipment.success) {
      console.error("Equipment validation failed:", validatedEquipment.error);

      // Try to fix common issues automatically
      const equipmentData = result.object.equipment as any;

      // Set default values for missing required fields
      if (!equipmentData.price && equipmentData.price !== 0) {
        equipmentData.price = 0;
      }
      if (!equipmentData.isActive && equipmentData.isActive !== false) {
        equipmentData.isActive = true;
      }

      // Try validation again with fixed data
      const retryValidation = equipmentSchema.safeParse(equipmentData);

      if (!retryValidation.success) {
        console.error(
          "Equipment validation failed after retry:",
          retryValidation.error
        );
        return NextResponse.json(
          {
            success: false,
            error: `Failed to extract valid equipment data from PDF. Validation errors: ${retryValidation.error.errors
              .map((e) => `${e.path.join(".")}: ${e.message}`)
              .join(", ")}`,
            confidence: result.object.confidence,
          },
          { status: 400 }
        );
      }

      // Use the fixed data
      return NextResponse.json({
        success: true,
        equipment: retryValidation.data,
        confidence: result.object.confidence,
      });
    }

    // Return the structured equipment data
    return NextResponse.json({
      success: true,
      equipment: validatedEquipment.data,
      confidence: result.object.confidence,
    });
  } catch (error) {
    console.error("Document parsing error:", error);

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data format" },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // Don't expose internal errors to the client
      return NextResponse.json(
        { success: false, error: "Failed to process document" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}
