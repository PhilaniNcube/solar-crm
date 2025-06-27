import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Geocoding API key not configured" },
        { status: 500 }
      );
    }

    // Use Google Geocoding API
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.append("address", query);
    url.searchParams.append("key", apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(
        `Google Geocoding API error: ${data.status} - ${
          data.error_message || "Unknown error"
        }`
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Google Geocoding API error:", error);
    return NextResponse.json(
      { error: "Failed to geocode address" },
      { status: 500 }
    );
  }
}
