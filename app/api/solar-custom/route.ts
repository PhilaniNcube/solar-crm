import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      latitude,
      longitude,
      panelCapacityWatts,
      panelHeightMeters,
      panelWidthMeters,
      requiredQuality = "HIGH",
    } = await request.json();

    if (
      !latitude ||
      !longitude ||
      !panelCapacityWatts ||
      !panelHeightMeters ||
      !panelWidthMeters
    ) {
      return NextResponse.json(
        { error: "Latitude, longitude, and panel specifications are required" },
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

    // First get the building insights to get the building data
    const buildingUrl = new URL(
      "https://solar.googleapis.com/v1/buildingInsights:findClosest"
    );
    buildingUrl.searchParams.append("location.latitude", latitude.toString());
    buildingUrl.searchParams.append("location.longitude", longitude.toString());
    buildingUrl.searchParams.append("requiredQuality", requiredQuality);
    buildingUrl.searchParams.append("key", apiKey);

    const buildingResponse = await fetch(buildingUrl.toString());

    if (!buildingResponse.ok) {
      throw new Error(`Google Solar API error: ${buildingResponse.status}`);
    }

    const buildingData = await buildingResponse.json();

    if (!buildingData.solarPotential) {
      return NextResponse.json(
        {
          error: "No solar potential data available for this location",
        },
        { status: 404 }
      );
    }

    // Calculate panel area
    const panelAreaMeters2 = panelHeightMeters * panelWidthMeters;

    // Get roof segments and calculate configurations
    const roofSegmentStats = buildingData.solarPotential.roofSegmentStats || [];
    const maxArrayAreaMeters2 = buildingData.solarPotential.maxArrayAreaMeters2;

    // Calculate how many panels can fit based on new dimensions
    const maxPanelsBasedOnArea = Math.floor(
      maxArrayAreaMeters2 / panelAreaMeters2
    );

    // Generate configurations with different panel counts
    const customConfigs = [];
    const configCounts = [
      Math.floor(maxPanelsBasedOnArea * 0.25),
      Math.floor(maxPanelsBasedOnArea * 0.5),
      Math.floor(maxPanelsBasedOnArea * 0.75),
      maxPanelsBasedOnArea,
    ].filter((count) => count > 0);

    // Use the original sunshine data for energy calculations
    const avgSunshineHours =
      buildingData.solarPotential.maxSunshineHoursPerYear;
    const peakSunHoursPerDay = avgSunshineHours / 365;

    for (const panelCount of configCounts) {
      // Estimate energy production based on panel capacity and sunshine
      // This is a simplified calculation - the actual API uses more complex models
      const yearlyEnergyDcKwh =
        (panelCount * panelCapacityWatts * peakSunHoursPerDay * 365) / 1000;

      // Create roof segment summaries (simplified)
      const roofSegmentSummaries = roofSegmentStats
        .map((segment: any, index: number) => {
          const segmentPanels = Math.floor(
            panelCount * (segment.stats.areaMeters2 / maxArrayAreaMeters2)
          );
          const segmentEnergy =
            (segmentPanels * panelCapacityWatts * peakSunHoursPerDay * 365) /
            1000;

          return {
            pitchDegrees: segment.pitchDegrees,
            azimuthDegrees: segment.azimuthDegrees,
            panelsCount: segmentPanels,
            yearlyEnergyDcKwh: segmentEnergy,
            segmentIndex: index,
          };
        })
        .filter((summary: any) => summary.panelsCount > 0);

      customConfigs.push({
        panelsCount: panelCount,
        yearlyEnergyDcKwh: yearlyEnergyDcKwh,
        roofSegmentSummaries: roofSegmentSummaries,
      });
    }

    // Return the recalculated data
    const customSolarData = {
      buildingInfo: {
        name: buildingData.name,
        center: buildingData.center,
        postalCode: buildingData.postalCode,
        administrativeArea: buildingData.administrativeArea,
        regionCode: buildingData.regionCode,
        imageryDate: buildingData.imageryDate,
        imageryQuality: buildingData.imageryQuality,
      },
      solarPotential: {
        ...buildingData.solarPotential,
        panelCapacityWatts: panelCapacityWatts,
        panelHeightMeters: panelHeightMeters,
        panelWidthMeters: panelWidthMeters,
        maxArrayPanelsCount: maxPanelsBasedOnArea,
        solarPanelConfigs: customConfigs,
        // Keep original financial analyses as they depend on local utility rates
        financialAnalyses: buildingData.solarPotential.financialAnalyses?.map(
          (analysis: any) => ({
            ...analysis,
            // Update panel config index to match our new configs
            panelConfigIndex:
              analysis.panelConfigIndex >= customConfigs.length
                ? -1
                : analysis.panelConfigIndex,
          })
        ),
      },
      customCalculation: true,
      originalPanelSpecs: {
        panelCapacityWatts: buildingData.solarPotential.panelCapacityWatts,
        panelHeightMeters: buildingData.solarPotential.panelHeightMeters,
        panelWidthMeters: buildingData.solarPotential.panelWidthMeters,
      },
    };

    return NextResponse.json(customSolarData);
  } catch (error) {
    console.error("Custom solar calculation error:", error);

    return NextResponse.json(
      {
        error: "Failed to calculate custom solar configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
