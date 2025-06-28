import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  solarPotential: any | null;
  customCalculation?: boolean;
  originalPanelSpecs?: {
    panelCapacityWatts: number;
    panelHeightMeters: number;
    panelWidthMeters: number;
  };
}

interface SolarInsightsParams {
  latitude: number;
  longitude: number;
  requiredQuality?: string;
}

interface CustomPanelParams extends SolarInsightsParams {
  panelCapacityWatts: number;
  panelHeightMeters: number;
  panelWidthMeters: number;
}

// Fetch solar insights from the API
const fetchSolarInsights = async (
  params: SolarInsightsParams
): Promise<SolarInsightsData> => {
  const response = await fetch("/api/solar-insights", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...params,
      requiredQuality: params.requiredQuality || "HIGH",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.details || errorData.error || "Failed to fetch solar insights"
    );
  }

  return response.json();
};

// Fetch custom panel calculation
const fetchCustomPanelCalculation = async (
  params: CustomPanelParams
): Promise<SolarInsightsData> => {
  const response = await fetch("/api/solar-custom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...params,
      requiredQuality: params.requiredQuality || "HIGH",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.details ||
        errorData.error ||
        "Failed to recalculate with custom panels"
    );
  }

  return response.json();
};

// Hook for solar insights query (manual trigger)
export function useSolarInsights(params: SolarInsightsParams) {
  return useQuery({
    queryKey: [
      "solar-insights",
      params.latitude,
      params.longitude,
      params.requiredQuality,
    ],
    queryFn: () => fetchSolarInsights(params),
    enabled: false, // Manual trigger only
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// Hook for triggering solar insights fetch
export function useSolarInsightsMutation(params: SolarInsightsParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fetchSolarInsights(params),
    onSuccess: (data) => {
      // Update the query cache
      queryClient.setQueryData(
        [
          "solar-insights",
          params.latitude,
          params.longitude,
          params.requiredQuality || "HIGH",
        ],
        data
      );
      toast.success("Solar insights loaded successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook for custom panel calculation mutation
export function useCustomPanelMutation(baseParams: SolarInsightsParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      customParams: Omit<
        CustomPanelParams,
        "latitude" | "longitude" | "requiredQuality"
      >
    ) =>
      fetchCustomPanelCalculation({
        ...baseParams,
        ...customParams,
        requiredQuality: baseParams.requiredQuality || "HIGH",
      }),
    onSuccess: (data) => {
      // Update the query cache with the new custom calculation
      queryClient.setQueryData(
        [
          "solar-insights",
          baseParams.latitude,
          baseParams.longitude,
          baseParams.requiredQuality || "HIGH",
        ],
        data
      );
      toast.success("Solar configuration recalculated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook to get cached solar data
export function useCachedSolarData(params: SolarInsightsParams) {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<SolarInsightsData>([
    "solar-insights",
    params.latitude,
    params.longitude,
    params.requiredQuality || "HIGH",
  ]);
}
