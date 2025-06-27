"use client";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

interface SolarInsightsProps {
  latitude: number;
  longitude: number;
  address?: string;
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
}

export function SolarInsightsCard({
  latitude,
  longitude,
  address,
}: SolarInsightsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [solarData, setSolarData] = useState<SolarInsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSolarInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/solar-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude,
          longitude,
          requiredQuality: "HIGH",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details ||
            errorData.error ||
            "Failed to fetch solar insights"
        );
      }

      const data = await response.json();
      setSolarData(data);
      toast.success("Solar insights loaded successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch solar insights";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
        {!solarData && !error && (
          <div className="text-center py-8">
            <Button onClick={fetchSolarInsights} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sun className="h-4 w-4 mr-2" />
              )}
              {isLoading
                ? "Analyzing Solar Potential..."
                : "Analyze Solar Potential"}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Get detailed insights about solar panel potential
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-red-800 font-medium">
                Unable to fetch solar data
              </p>
              <p className="text-red-600 text-sm">{error}</p>
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
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Panel Specifications
                  </h3>
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
                        </h3>
                        <div className="space-y-3">
                          {solarData.solarPotential.solarPanelConfigs
                            .slice(0, 3)
                            .map((config, index) => (
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
                            .filter((analysis) => analysis.financialDetails)
                            .slice(0, 2)
                            .map((analysis, index) => (
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
