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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface GooglePlacesCardProps {
  customerId: Id<"customers">;
  orgSlug: string;
  currentAddress?: string;
  initialCoordinates?: {
    lat: number;
    lng: number;
  };
}

interface PlaceDetails {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  types: string[];
}

export function GooglePlacesCard({
  customerId,
  orgSlug,
  currentAddress = "",
  initialCoordinates,
}: GooglePlacesCardProps) {
  const [searchQuery, setSearchQuery] = useState(currentAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [coordinates, setCoordinates] = useState(initialCoordinates);

  const updateCustomerLocation = useMutation(
    api.customers.updateCustomerLocation
  );

  const searchPlaces = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter an address to search");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/google-places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to search places");
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const place = data.results[0];
        setPlaceDetails(place);
        setCoordinates({
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        });
        toast.success("Address found successfully!");
      } else {
        toast.error("No results found for this address");
      }
    } catch (error) {
      console.error("Error searching places:", error);
      toast.error("Error searching for address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveLocation = async () => {
    if (!placeDetails || !coordinates) {
      toast.error("No location data to save");
      return;
    }

    try {
      await updateCustomerLocation({
        customerId,
        orgSlug,
        address: placeDetails.formatted_address,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        placeId: placeDetails.place_id,
      });

      toast.success("Location saved successfully!");
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Failed to save location. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location & Solar Assessment
        </CardTitle>
        <CardDescription>
          Find precise coordinates for Google Solar API integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter street address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchPlaces()}
          />
          <Button onClick={searchPlaces} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Results */}
        {placeDetails && coordinates && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Formatted Address
              </label>
              <p className="text-sm text-gray-900">
                {placeDetails.formatted_address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Latitude
                </label>
                <p className="text-sm text-gray-900 font-mono">
                  {coordinates.lat.toFixed(6)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Longitude
                </label>
                <p className="text-sm text-gray-900 font-mono">
                  {coordinates.lng.toFixed(6)}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Place Types
              </label>
              <div className="flex flex-wrap gap-1 mt-1">
                {placeDetails.types.slice(0, 3).map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={saveLocation} className="w-full">
              Save Location Data
            </Button>
          </div>
        )}

        {/* Current Coordinates Display */}
        {coordinates && !placeDetails && (
          <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              Current Coordinates
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-700">Lat:</span>{" "}
                <span className="font-mono">{coordinates.lat.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-blue-700">Lng:</span>{" "}
                <span className="font-mono">{coordinates.lng.toFixed(6)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            • Use precise addresses for accurate solar potential calculations
          </p>
          <p>• Coordinates will be used for Google Solar API integration</p>
          <p>• This data helps determine roof area and solar irradiance</p>
        </div>
      </CardContent>
    </Card>
  );
}
