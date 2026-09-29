const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

export type CitySuggestion = {
  id: string;
  /** Display label, e.g. "Austin, Texas, United States". */
  label: string;
  lat: number;
  lng: number;
  /** ISO 3166-1 alpha-2 country code, e.g. "us" — lowercase, as Mapbox returns it. */
  countryCode: string | null;
};

type MapboxContextEntry = { id: string; short_code?: string };

/** Search-as-you-type city lookup via Mapbox Geocoding, restricted to place-level results. */
export async function searchCities(query: string): Promise<CitySuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed || !MAPBOX_TOKEN) return [];

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?types=place&autocomplete=true&limit=6&access_token=${MAPBOX_TOKEN}`;
  const response = await fetch(url);
  if (!response.ok) return [];

  const data = await response.json();
  return (data.features ?? []).map(
    (feature: {
      id: string;
      place_name: string;
      center: [number, number];
      context?: MapboxContextEntry[];
    }) => {
      const country = feature.context?.find((entry) => entry.id.startsWith('country.'));
      return {
        id: feature.id,
        label: feature.place_name,
        lng: feature.center[0],
        lat: feature.center[1],
        countryCode: country?.short_code?.toLowerCase() ?? null,
      };
    }
  );
}

/** Reverse-geocodes coordinates (e.g. from device GPS) to a country code, for flag rendering. */
export async function countryCodeForCoords(lat: number, lng: number): Promise<string | null> {
  if (!MAPBOX_TOKEN) return null;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=country&access_token=${MAPBOX_TOKEN}`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  const feature = data.features?.[0] as { properties?: { short_code?: string } } | undefined;
  return feature?.properties?.short_code?.toLowerCase() ?? null;
}
