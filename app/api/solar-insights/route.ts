import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      latitude,
      longitude,
      requiredQuality = "HIGH",
    } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude parameters are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Solar API key not configured" },
        { status: 500 }
      );
    }

    // Use Google Solar API Building Insights endpoint
    const url = new URL(
      "https://solar.googleapis.com/v1/buildingInsights:findClosest"
    );
    url.searchParams.append("location.latitude", latitude.toString());
    url.searchParams.append("location.longitude", longitude.toString());
    url.searchParams.append("requiredQuality", requiredQuality);
    url.searchParams.append("key", apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Google Solar API error: ${response.status} - ${errorText}`
      );
      throw new Error(`Google Solar API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the response to include only the most relevant data
    const solarInsights = {
      buildingInfo: {
        name: data.name,
        center: data.center,
        postalCode: data.postalCode,
        administrativeArea: data.administrativeArea,
        regionCode: data.regionCode,
        imageryDate: data.imageryDate,
        imageryQuality: data.imageryQuality,
      },
      solarPotential: data.solarPotential
        ? {
            maxArrayPanelsCount: data.solarPotential.maxArrayPanelsCount,
            maxArrayAreaMeters2: data.solarPotential.maxArrayAreaMeters2,
            maxSunshineHoursPerYear:
              data.solarPotential.maxSunshineHoursPerYear,
            carbonOffsetFactorKgPerMwh:
              data.solarPotential.carbonOffsetFactorKgPerMwh,
            panelCapacityWatts: data.solarPotential.panelCapacityWatts,
            panelHeightMeters: data.solarPotential.panelHeightMeters,
            panelWidthMeters: data.solarPotential.panelWidthMeters,
            panelLifetimeYears: data.solarPotential.panelLifetimeYears,
            wholeRoofStats: data.solarPotential.wholeRoofStats,
            roofSegmentStats: data.solarPotential.roofSegmentStats,
            solarPanelConfigs: data.solarPotential.solarPanelConfigs?.slice(
              0,
              5
            ), // Limit to first 5 configs
            financialAnalyses: data.solarPotential.financialAnalyses?.slice(
              0,
              3
            ), // Limit to first 3 analyses
          }
        : null,
      rawResponse: data, // Include full response for debugging
    };

    return NextResponse.json(solarInsights);
  } catch (error) {
    console.error("Solar insights API error:", error);

    // Check if it's a specific Solar API error
    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json(
        {
          error: "No building found at the specified coordinates",
          details:
            "The Solar API couldn't find building data for this location. Try a different address or coordinates.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch solar insights",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
