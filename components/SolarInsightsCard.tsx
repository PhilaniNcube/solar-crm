"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sun,
  Zap,
  Building,
  DollarSign,
  Leaf,
  Calendar,
  MapPin,
  Loader2,
  AlertTriangle,
  Settings,
  RotateCcw,
} from "lucide-react";
import {
  useSolarInsightsMutation,
  useCustomPanelMutation,
  useCachedSolarData,
} from "@/hooks/useSolarData";

interface SolarInsightsProps {
  latitude: number;
  longitude: number;
  address?: string;
  onRoofSegmentsUpdate?: (
    segments: Array<{
      pitchDegrees: number;
      azimuthDegrees: number;
      panelsCount: number;
      yearlyEnergyDcKwh: number;
      segmentIndex: number;
    }>
  ) => void;
}

interface SolarPotential {
  maxArrayPanelsCount: number;
  maxArrayAreaMeters2: number;
  maxSunshineHoursPerYear: number;
  carbonOffsetFactorKgPerMwh: number;
  panelCapacityWatts: number;
  panelHeightMeters: number;
  panelWidthMeters: number;
  panelLifetimeYears: number;
  wholeRoofStats: {
    areaMeters2: number;
    sunshineQuantiles: number[];
    groundAreaMeters2: number;
  };
  solarPanelConfigs?: Array<{
    panelsCount: number;
    yearlyEnergyDcKwh: number;
    roofSegmentSummaries: Array<{
      pitchDegrees: number;
      azimuthDegrees: number;
      panelsCount: number;
      yearlyEnergyDcKwh: number;
      segmentIndex: number;
    }>;
  }>;
  financialAnalyses?: Array<{
    monthlyBill: {
      currencyCode: string;
      units: string;
    };
    panelConfigIndex: number;
    financialDetails?: {
      initialAcKwhPerYear: number;
      federalIncentive?: {
        currencyCode: string;
        units: string;
      };
      costOfElectricityWithoutSolar?: {
        currencyCode: string;
        units: string;
      };
      solarPercentage: number;
    };
    cashPurchaseSavings?: {
      paybackYears: number;
      savings: {
        savingsYear20: {
          currencyCode: string;
          units: string;
        };
      };
    };
  }>;
}

interface SolarInsightsData {
  buildingInfo: {
    name: string;
    center: {
      latitude: number;
      longitude: number;
    };
    postalCode: string;
    administrativeArea: string;
    regionCode: string;
    imageryDate: {
      year: number;
      month: number;
      day: number;
    };
    imageryQuality: string;
  };
  solarPotential: SolarPotential | null;
  customCalculation?: boolean;
  originalPanelSpecs?: {
    panelCapacityWatts: number;
    panelHeightMeters: number;
    panelWidthMeters: number;
  };
}

export function SolarInsightsCard({
  latitude,
  longitude,
  address,
  onRoofSegmentsUpdate,
}: SolarInsightsProps) {
  const [showCustomPanels, setShowCustomPanels] = useState(false);

  // Custom panel specifications
  const [customPanelCapacity, setCustomPanelCapacity] = useState<number>(400);
  const [customPanelHeight, setCustomPanelHeight] = useState<number>(1.879);
  const [customPanelWidth, setCustomPanelWidth] = useState<number>(1.045);

  // TanStack Query hooks
  const solarParams = { latitude, longitude, requiredQuality: "HIGH" };
  const solarData = useCachedSolarData(solarParams);
  const solarMutation = useSolarInsightsMutation(solarParams);
  const customPanelMutation = useCustomPanelMutation(solarParams);

  // Memoize roof segments extraction to prevent unnecessary recalculations
  const roofSegments = useMemo(() => {
    if (solarData?.solarPotential?.solarPanelConfigs) {
      return solarData.solarPotential.solarPanelConfigs
        .slice(0, 1) // Use the first (best) configuration
        .flatMap((config: any) => config.roofSegmentSummaries || []);
    }
    return [];
  }, [solarData?.solarPotential?.solarPanelConfigs]);

  // Use useEffect to call the callback when roof segments change
  useEffect(() => {
    if (onRoofSegmentsUpdate && roofSegments.length > 0) {
      onRoofSegmentsUpdate(roofSegments);
    }
  }, [roofSegments, onRoofSegmentsUpdate]);

  // Memoize panel specs to only update when data first loads (not on custom recalculations)
  const defaultPanelSpecs = useMemo(() => {
    if (solarData?.solarPotential && !solarData.customCalculation) {
      return {
        capacity: solarData.solarPotential.panelCapacityWatts,
        height: solarData.solarPotential.panelHeightMeters,
        width: solarData.solarPotential.panelWidthMeters,
      };
    }
    return null;
  }, [solarData?.solarPotential, solarData?.customCalculation]);

  // Use useEffect to update custom panel specs when solar data is first loaded
  useEffect(() => {
    if (defaultPanelSpecs) {
      setCustomPanelCapacity(defaultPanelSpecs.capacity);
      setCustomPanelHeight(defaultPanelSpecs.height);
      setCustomPanelWidth(defaultPanelSpecs.width);
    }
  }, [defaultPanelSpecs]);

  const fetchSolarInsights = () => {
    solarMutation.mutate();
  };

  const recalculateWithCustomPanels = () => {
    if (!solarData) {
      return;
    }

    customPanelMutation.mutate({
      panelCapacityWatts: customPanelCapacity,
      panelHeightMeters: customPanelHeight,
      panelWidthMeters: customPanelWidth,
    });
  };

  const resetToOriginalSpecs = () => {
    if (solarData?.originalPanelSpecs) {
      setCustomPanelCapacity(solarData.originalPanelSpecs.panelCapacityWatts);
      setCustomPanelHeight(solarData.originalPanelSpecs.panelHeightMeters);
      setCustomPanelWidth(solarData.originalPanelSpecs.panelWidthMeters);
    }
  };

  const formatCurrency = (amount: string | number, currency = "USD") => {
    const numAmount = typeof amount === "string" ? parseInt(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (date: { year: number; month: number; day: number }) => {
    return new Date(date.year, date.month - 1, date.day).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-orange-500" />
          Solar Potential Analysis
        </CardTitle>
        <CardDescription>
          Detailed solar assessment powered by Google Solar API
        </CardDescription>
        {address && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            {address}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!solarData && !solarMutation.error && (
          <div className="text-center py-8">
            <Button
              onClick={fetchSolarInsights}
              disabled={solarMutation.isPending}
            >
              {solarMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sun className="h-4 w-4 mr-2" />
              )}
              {solarMutation.isPending
                ? "Analyzing Solar Potential..."
                : "Analyze Solar Potential"}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Get detailed insights about solar panel potential
            </p>
          </div>
        )}

        {solarMutation.error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-red-800 font-medium">
                Unable to fetch solar data
              </p>
              <p className="text-red-600 text-sm">
                {solarMutation.error.message}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSolarInsights}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {solarData && (
          <div className="space-y-6">
            {/* Custom Panel Specifications */}
            <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Custom Panel Specifications
                </h3>
                <div className="flex gap-2">
                  {solarData.originalPanelSpecs && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetToOriginalSpecs}
                      className="text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset to API Default
                    </Button>
                  )}
                  <Button
                    variant={showCustomPanels ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setShowCustomPanels(!showCustomPanels)}
                  >
                    {showCustomPanels ? "Hide" : "Customize"}
                  </Button>
                </div>
              </div>

              {showCustomPanels && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="panelCapacity"
                        className="text-sm font-medium"
                      >
                        Panel Capacity (Watts)
                      </Label>
                      <Input
                        id="panelCapacity"
                        type="number"
                        value={customPanelCapacity}
                        onChange={(e) =>
                          setCustomPanelCapacity(Number(e.target.value))
                        }
                        min="100"
                        max="800"
                        step="10"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="panelHeight"
                        className="text-sm font-medium"
                      >
                        Panel Height (m)
                      </Label>
                      <Input
                        id="panelHeight"
                        type="number"
                        value={customPanelHeight}
                        onChange={(e) =>
                          setCustomPanelHeight(Number(e.target.value))
                        }
                        min="0.5"
                        max="3.0"
                        step="0.01"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="panelWidth"
                        className="text-sm font-medium"
                      >
                        Panel Width (m)
                      </Label>
                      <Input
                        id="panelWidth"
                        type="number"
                        value={customPanelWidth}
                        onChange={(e) =>
                          setCustomPanelWidth(Number(e.target.value))
                        }
                        min="0.5"
                        max="3.0"
                        step="0.01"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-gray-600">
                      Panel Area:{" "}
                      {(customPanelHeight * customPanelWidth).toFixed(2)} m² •
                      Power Density:{" "}
                      {(
                        customPanelCapacity /
                        (customPanelHeight * customPanelWidth)
                      ).toFixed(0)}{" "}
                      W/m²
                    </div>
                    <Button
                      onClick={recalculateWithCustomPanels}
                      disabled={customPanelMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {customPanelMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      {customPanelMutation.isPending
                        ? "Recalculating..."
                        : "Recalculate"}
                    </Button>
                  </div>
                </div>
              )}

              {solarData.customCalculation && (
                <div className="mt-2 p-2 bg-blue-100 rounded text-sm text-blue-800">
                  ✓ Configurations updated with custom panel specifications
                </div>
              )}
            </div>

            {/* Building Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <span className="text-sm text-blue-700">Imagery Date:</span>
                <p className="font-mono text-sm">
                  {formatDate(solarData.buildingInfo.imageryDate)}
                </p>
              </div>
              <div>
                <span className="text-sm text-blue-700">Quality:</span>
                <Badge variant="outline" className="ml-1">
                  {solarData.buildingInfo.imageryQuality}
                </Badge>
              </div>
            </div>

            {solarData.solarPotential ? (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Building className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-800">
                      {solarData.solarPotential.maxArrayPanelsCount}
                    </p>
                    <p className="text-xs text-green-700">Max Panels</p>
                  </div>

                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <Sun className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-800">
                      {solarData.solarPotential.maxSunshineHoursPerYear.toLocaleString()}
                    </p>
                    <p className="text-xs text-yellow-700">
                      Sunshine Hours/Year
                    </p>
                  </div>

                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-800">
                      {Math.round(solarData.solarPotential.maxArrayAreaMeters2)}
                    </p>
                    <p className="text-xs text-blue-700">Max Array Area (m²)</p>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Leaf className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-800">
                      {Math.round(
                        solarData.solarPotential.carbonOffsetFactorKgPerMwh
                      )}
                    </p>
                    <p className="text-xs text-purple-700">
                      CO₂ Offset (kg/MWh)
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Panel Specifications */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Panel Specifications
                    </h3>
                    {solarData.customCalculation && (
                      <Badge variant="secondary" className="text-xs">
                        Custom Configuration
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Capacity:</span>
                      <p className="font-medium">
                        {solarData.solarPotential.panelCapacityWatts}W
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Dimensions:</span>
                      <p className="font-medium">
                        {solarData.solarPotential.panelHeightMeters}m ×{" "}
                        {solarData.solarPotential.panelWidthMeters}m
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Lifetime:</span>
                      <p className="font-medium">
                        {solarData.solarPotential.panelLifetimeYears} years
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Roof Area:</span>
                      <p className="font-medium">
                        {Math.round(
                          solarData.solarPotential.wholeRoofStats.areaMeters2
                        )}{" "}
                        m²
                      </p>
                    </div>
                  </div>

                  {solarData.originalPanelSpecs &&
                    solarData.customCalculation && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
                        <p className="font-medium text-gray-700 mb-1">
                          Original API Specifications:
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-gray-600">
                          <span>
                            {solarData.originalPanelSpecs.panelCapacityWatts}W
                          </span>
                          <span>
                            {solarData.originalPanelSpecs.panelHeightMeters}m ×{" "}
                            {solarData.originalPanelSpecs.panelWidthMeters}m
                          </span>
                          <span>
                            Area:{" "}
                            {(
                              solarData.originalPanelSpecs.panelHeightMeters *
                              solarData.originalPanelSpecs.panelWidthMeters
                            ).toFixed(2)}{" "}
                            m²
                          </span>
                        </div>
                      </div>
                    )}
                </div>

                {/* Solar Panel Configurations */}
                {solarData.solarPotential.solarPanelConfigs &&
                  solarData.solarPotential.solarPanelConfigs.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Recommended Configurations
                          {solarData.customCalculation && (
                            <Badge variant="outline" className="text-xs ml-2">
                              Recalculated
                            </Badge>
                          )}
                        </h3>
                        <div className="space-y-3">
                          {solarData.customCalculation && (
                            <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                              <strong>Note:</strong> Configurations recalculated
                              using custom panel specifications. Energy
                              estimates are simplified calculations based on
                              roof area and sunshine data.
                            </div>
                          )}

                          {solarData.solarPotential.solarPanelConfigs
                            .slice(0, 3)
                            .map((config: any, index: number) => (
                              <div
                                key={index}
                                className="p-3 border rounded-lg"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">
                                    Configuration {index + 1}
                                  </span>
                                  <Badge variant="secondary">
                                    {config.panelsCount} panels
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">
                                      Annual Energy:
                                    </span>
                                    <p className="font-medium">
                                      {Math.round(
                                        config.yearlyEnergyDcKwh
                                      ).toLocaleString()}{" "}
                                      kWh
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Monthly Avg:
                                    </span>
                                    <p className="font-medium">
                                      {Math.round(
                                        config.yearlyEnergyDcKwh / 12
                                      ).toLocaleString()}{" "}
                                      kWh
                                    </p>
                                  </div>
                                </div>

                                {/* Roof Segments Details */}
                                {config.roofSegmentSummaries &&
                                  config.roofSegmentSummaries.length > 0 && (
                                    <div className="mt-3 border-t pt-3">
                                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                                        <Building className="h-3 w-3" />
                                        Roof Segments (
                                        {config.roofSegmentSummaries.length})
                                      </h4>
                                      <div className="space-y-2">
                                        {config.roofSegmentSummaries.map(
                                          (
                                            segment: any,
                                            segmentIndex: number
                                          ) => (
                                            <div
                                              key={segmentIndex}
                                              className="p-2 bg-gray-50 rounded text-xs"
                                            >
                                              <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium">
                                                  Segment{" "}
                                                  {segment.segmentIndex + 1}
                                                </span>
                                                <span className="text-gray-600">
                                                  {segment.panelsCount} panels
                                                </span>
                                              </div>
                                              <div className="grid grid-cols-3 gap-2 text-gray-600">
                                                <div>
                                                  <span className="text-gray-500">
                                                    Pitch:
                                                  </span>
                                                  <div className="font-medium">
                                                    {segment.pitchDegrees}°
                                                  </div>
                                                </div>
                                                <div>
                                                  <span className="text-gray-500">
                                                    Azimuth:
                                                  </span>
                                                  <div className="font-medium">
                                                    {segment.azimuthDegrees}°
                                                  </div>
                                                </div>
                                                <div>
                                                  <span className="text-gray-500">
                                                    Energy:
                                                  </span>
                                                  <div className="font-medium">
                                                    {Math.round(
                                                      segment.yearlyEnergyDcKwh
                                                    ).toLocaleString()}{" "}
                                                    kWh
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>

                                      {/* Summary of roof segment characteristics */}
                                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                        <div className="grid grid-cols-2 gap-2 text-blue-700">
                                          <div>
                                            <span className="font-medium">
                                              Avg Pitch:
                                            </span>{" "}
                                            {Math.round(
                                              config.roofSegmentSummaries.reduce(
                                                (sum: number, s: any) =>
                                                  sum + s.pitchDegrees,
                                                0
                                              ) /
                                                config.roofSegmentSummaries
                                                  .length
                                            )}
                                            °
                                          </div>
                                          <div>
                                            <span className="font-medium">
                                              Primary Orientation:
                                            </span>{" "}
                                            {(() => {
                                              const avgAzimuth =
                                                config.roofSegmentSummaries.reduce(
                                                  (sum: number, s: any) =>
                                                    sum + s.azimuthDegrees,
                                                  0
                                                ) /
                                                config.roofSegmentSummaries
                                                  .length;
                                              if (
                                                avgAzimuth >= 337.5 ||
                                                avgAzimuth < 22.5
                                              )
                                                return "N";
                                              if (
                                                avgAzimuth >= 22.5 &&
                                                avgAzimuth < 67.5
                                              )
                                                return "NE";
                                              if (
                                                avgAzimuth >= 67.5 &&
                                                avgAzimuth < 112.5
                                              )
                                                return "E";
                                              if (
                                                avgAzimuth >= 112.5 &&
                                                avgAzimuth < 157.5
                                              )
                                                return "SE";
                                              if (
                                                avgAzimuth >= 157.5 &&
                                                avgAzimuth < 202.5
                                              )
                                                return "S";
                                              if (
                                                avgAzimuth >= 202.5 &&
                                                avgAzimuth < 247.5
                                              )
                                                return "SW";
                                              if (
                                                avgAzimuth >= 247.5 &&
                                                avgAzimuth < 292.5
                                              )
                                                return "W";
                                              return "NW";
                                            })()}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  )}

                {/* Financial Analysis */}
                {solarData.solarPotential.financialAnalyses &&
                  solarData.solarPotential.financialAnalyses.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Financial Analysis
                        </h3>
                        <div className="space-y-3">
                          {solarData.solarPotential.financialAnalyses
                            .filter(
                              (analysis: any) => analysis.financialDetails
                            )
                            .slice(0, 2)
                            .map((analysis: any, index: number) => (
                              <div
                                key={index}
                                className="p-3 border rounded-lg bg-gray-50"
                              >
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">
                                      Monthly Bill:
                                    </span>
                                    <p className="font-medium">
                                      {formatCurrency(
                                        analysis.monthlyBill.units,
                                        analysis.monthlyBill.currencyCode
                                      )}
                                    </p>
                                  </div>
                                  {analysis.financialDetails && (
                                    <>
                                      <div>
                                        <span className="text-gray-600">
                                          Solar Coverage:
                                        </span>
                                        <p className="font-medium">
                                          {Math.round(
                                            analysis.financialDetails
                                              .solarPercentage
                                          )}
                                          %
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">
                                          Annual Generation:
                                        </span>
                                        <p className="font-medium">
                                          {Math.round(
                                            analysis.financialDetails
                                              .initialAcKwhPerYear
                                          ).toLocaleString()}{" "}
                                          kWh
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                                {analysis.cashPurchaseSavings && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-600">
                                          Payback Period:
                                        </span>
                                        <p className="font-medium">
                                          {
                                            analysis.cashPurchaseSavings
                                              .paybackYears
                                          }{" "}
                                          years
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">
                                          20-Year Savings:
                                        </span>
                                        <p className="font-medium text-green-600">
                                          {formatCurrency(
                                            analysis.cashPurchaseSavings.savings
                                              .savingsYear20.units,
                                            analysis.cashPurchaseSavings.savings
                                              .savingsYear20.currencyCode
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
              </>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  No solar potential data available
                </p>
                <p className="text-sm text-gray-500">
                  This location may not have sufficient imagery or building data
                  for solar analysis.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
