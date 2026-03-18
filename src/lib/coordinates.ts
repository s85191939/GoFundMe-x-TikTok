export interface Coordinates {
  lat: number;
  lng: number;
}

const CITY_COORDINATES: Record<string, Coordinates> = {
  'Santa Rosa, CA': { lat: 38.4404, lng: -122.7141 },
  'Houston, TX': { lat: 29.7604, lng: -95.3698 },
  'Portland, OR': { lat: 45.5152, lng: -122.6784 },
  'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
  'Denver, CO': { lat: 39.7392, lng: -104.9903 },
  'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
  'Austin, TX': { lat: 30.2672, lng: -97.7431 },
  'Sacramento, CA': { lat: 38.5816, lng: -121.4944 },
  'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
  'Nashville, TN': { lat: 36.1627, lng: -86.7816 },
};

export function getCoordinates(location: string): Coordinates | undefined {
  return CITY_COORDINATES[location];
}
