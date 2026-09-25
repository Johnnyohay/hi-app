const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

export type CitySuggestion = {
  id: string;
  /** Display label, e.g. "Austin, Texas, United States". */
  label: string;
  lat: number;
  lng: number;
};

/** Search-as-you-type city lookup via Mapbox Geocoding, restricted to place-level results. */
export async function searchCities(query: string): Promise<CitySuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed || !MAPBOX_TOKEN) return [];

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?types=place&autocomplete=true&limit=6&access_token=${MAPBOX_TOKEN}`;
  const response = await fetch(url);
  if (!response.ok) return [];

  const data = await response.json();
  return (data.features ?? []).map((feature: { id: string; place_name: string; center: [number, number] }) => ({
    id: feature.id,
    label: feature.place_name,
    lng: feature.center[0],
    lat: feature.center[1],
  }));
}
