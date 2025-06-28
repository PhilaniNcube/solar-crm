# Solar CRM - Google Solar API Integration

This project includes integration with Google's Solar API to provide solar potential analysis for customer addresses.

## Features

- **Geocoding**: Convert addresses to precise latitude/longitude coordinates using Google Geocoding API
- **Interactive Maps**: View building location with satellite imagery for roof assessment
- **Solar Analysis**: Get detailed solar potential data including:
  - Maximum number of solar panels that can fit
  - Annual sunshine hours
  - Roof area analysis
  - Carbon offset calculations
  - Financial analysis with savings projections
  - Panel configurations and energy production estimates
- **Custom Panel Specifications**: Override Google's default panel assumptions with your own:
  - Custom panel capacity (Watts)
  - Custom panel dimensions (height × width in meters)
  - Recalculated configurations based on your specifications
  - Compare original vs. custom panel performance

## Setup

### 1. Enable Google APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Geocoding API
   - Solar API
   - Maps JavaScript API (for building visualization)
4. Create an API key in Credentials section

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and add your Google API key:

```bash
GOOGLE_PLACES_API_KEY=your_google_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_api_key_here
```

Note: You can use the same API key for both if your Google Cloud project has all required APIs enabled.

### 3. API Endpoints

- `/api/google-places` - Geocoding API endpoint
- `/api/solar-insights` - Solar API endpoint for building insights
- `/api/solar-custom` - Custom panel calculations endpoint

### 4. Usage

1. Navigate to a customer detail page
2. Use the "Location & Solar Assessment" card to:
   - Enter and geocode an address
   - Save precise coordinates to the customer record
3. Once coordinates are saved, you can:
   - View the building location on an interactive satellite map
   - Assess roof conditions and potential shading issues
   - Use the "Solar Potential Analysis" card to:
     - Fetch detailed solar insights using Google's default panel specifications
     - Customize panel specifications (capacity, dimensions) if needed
     - Recalculate configurations with your custom panel specs
     - View panel configurations and financial projections
     - Compare original vs. custom panel performance

## Solar API Coverage

The Google Solar API has coverage in specific regions. Check [Google's coverage documentation](https://developers.google.com/maps/documentation/solar/coverage) for supported areas.

## Data Stored

For each customer with geocoded address:
- `address` - Formatted address from geocoding
- `latitude` - Precise latitude coordinate
- `longitude` - Precise longitude coordinate  
- `placeId` - Google Place ID for reference

Solar analysis data is fetched on-demand and not stored permanently.
