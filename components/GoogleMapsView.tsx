"use client";

import { useState, useCallback, useMemo } from "react";
import { GoogleMapsEmbed } from "@next/third-parties/google";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Maximize2, Satellite, Map, Layers, Info } from "lucide-react";

interface RoofSegment {
  pitchDegrees: number;
  azimuthDegrees: number;
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  segmentIndex: number;
  // Optional polygon coordinates for overlay (would come from Solar API if available)
  bounds?: Array<{ lat: number; lng: number }>;
}

interface GoogleMapsViewProps {
  latitude: number;
  longitude: number;
  address?: string;
  buildingName?: string;
  roofSegments?: RoofSegment[];
  showRoofOverlay?: boolean;
}

export function GoogleMapsView({
  latitude,
  longitude,
  address,
  buildingName,
  roofSegments = [],
  showRoofOverlay = false,
}: GoogleMapsViewProps) {
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("satellite");
  const [showOverlay, setShowOverlay] = useState(showRoofOverlay);

  // Memoize compass direction function
  const getCompassDirection = useCallback((azimuth: number) => {
    if (azimuth >= 337.5 || azimuth < 22.5) return "N";
    if (azimuth >= 22.5 && azimuth < 67.5) return "NE";
    if (azimuth >= 67.5 && azimuth < 112.5) return "E";
    if (azimuth >= 112.5 && azimuth < 157.5) return "SE";
    if (azimuth >= 157.5 && azimuth < 202.5) return "S";
    if (azimuth >= 202.5 && azimuth < 247.5) return "SW";
    if (azimuth >= 247.5 && azimuth < 292.5) return "W";
    return "NW";
  }, []);

  // Memoize colors array
  const colors = useMemo(
    () => [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#ffeaa7",
      "#dda0dd",
      "#98d8c8",
      "#fdcb6e",
      "#74b9ff",
      "#fd79a8",
    ],
    []
  );

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/@${latitude},${longitude},19z`;
    window.open(url, "_blank");
  };

  // Create map query with custom location pin
  const mapQuery = useMemo(() => {
    if (address) {
      return encodeURIComponent(address);
    }
    return `${latitude},${longitude}`;
  }, [latitude, longitude, address]);

  // For GoogleMapsEmbed, we'll use 'place' mode and control satellite view via maptype
  const embedMode = "place";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          Building Location
        </CardTitle>
        <CardDescription>
          Interactive satellite view for solar assessment
        </CardDescription>
        {address && <div className="text-sm text-gray-600 mt-1">{address}</div>}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Map Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={mapType === "satellite" ? "default" : "outline"}
              size="sm"
              onClick={() => setMapType("satellite")}
              className="text-xs"
            >
              <Satellite className="h-3 w-3 mr-1" />
              Satellite
            </Button>
            <Button
              variant={mapType === "roadmap" ? "default" : "outline"}
              size="sm"
              onClick={() => setMapType("roadmap")}
              className="text-xs"
            >
              <Map className="h-3 w-3 mr-1" />
              Map
            </Button>
            {roofSegments.length > 0 && (
              <Button
                variant={showOverlay ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOverlay(!showOverlay)}
                className="text-xs"
              >
                <Layers className="h-3 w-3 mr-1" />
                Roof Info
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={openInGoogleMaps}
            className="text-xs"
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            Open Full Map
          </Button>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-96 rounded-lg border border-gray-200 overflow-hidden">
          <GoogleMapsEmbed
            apiKey={
              process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
              process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
              ""
            }
            height={384}
            width="100%"
            mode={embedMode}
            q={mapQuery}
            zoom="19"
            maptype={mapType}
            style="border-radius: 8px;"
          />
        </div>

        {/* Roof Segments Information Panel (replaces overlay since GoogleMapsEmbed doesn't support overlays) */}
        {showOverlay && roofSegments.length > 0 && (
          <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-green-50">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-blue-800">
              <Layers className="h-4 w-4" />
              Roof Segments Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roofSegments.map((segment, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border-l-4 shadow-sm"
                  style={{ borderLeftColor: colors[index % colors.length] }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="font-medium text-sm">
                      Segment {segment.segmentIndex + 1}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span>Panels:</span>
                      <span className="font-medium">{segment.panelsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pitch:</span>
                      <span className="font-medium">
                        {segment.pitchDegrees}°
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Direction:</span>
                      <span className="font-medium">
                        {segment.azimuthDegrees}° (
                        {getCompassDirection(segment.azimuthDegrees)})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Energy/Year:</span>
                      <span className="font-medium text-green-600">
                        {Math.round(segment.yearlyEnergyDcKwh).toLocaleString()}{" "}
                        kWh
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800 flex items-start gap-2">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>
                Each segment represents a distinct roof surface with unique
                solar characteristics. The colors correspond to different roof
                segments analyzed by the Solar API.
              </span>
            </div>
          </div>
        )}

        {/* Coordinates Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <div>
            <span className="font-medium">Coordinates:</span>{" "}
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </div>
          <Badge variant="outline" className="text-xs">
            Zoom: 19 (Building Level)
          </Badge>
        </div>

        {/* Solar Assessment Note */}
        <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Solar Assessment Tips:</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside text-blue-600">
                <li>
                  Use satellite view to assess roof conditions and shading
                </li>
                <li>Check for nearby structures that may cast shadows</li>
                <li>Identify optimal panel placement areas on the roof</li>
                {roofSegments.length > 0 && (
                  <li>
                    Review "Roof Info" panel for detailed segment analysis
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
