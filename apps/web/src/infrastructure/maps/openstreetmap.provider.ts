import { isValidGeoCoordinates, type EventGeoLocation } from '../../domain/events/event.types';
import type {
  MapFallbackSearch,
  MapProvider,
  ResolvedMapData,
} from '../../domain/maps/map-provider';

const OSM_ALLOWED_HOST = 'www.openstreetmap.org';
const OSM_ORIGIN = `https://${OSM_ALLOWED_HOST}`;
const OSM_ATTRIBUTION_TEXT = '© Colaboradores de OpenStreetMap (ODbL)';
const OSM_ATTRIBUTION_URL = `${OSM_ORIGIN}/copyright`;
const BBOX_LAT_DELTA = 0.0045;
const BBOX_LON_DELTA = 0.006;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function assertSafeOsmUrl(url: URL): string {
  if (url.protocol !== 'https:' || url.hostname !== OSM_ALLOWED_HOST) {
    throw new Error('URL fuera de la allowlist de OpenStreetMap.');
  }
  return url.toString();
}

export class OpenStreetMapEmbedProvider implements MapProvider {
  readonly providerName = 'OpenStreetMap';

  resolveMapData(geo: EventGeoLocation): ResolvedMapData | null {
    if (!isValidGeoCoordinates(geo)) {
      return null;
    }

    const lat = Number(geo.latitude.toFixed(6));
    const lon = Number(geo.longitude.toFixed(6));

    const minLat = clamp(lat - BBOX_LAT_DELTA, -90, 90);
    const maxLat = clamp(lat + BBOX_LAT_DELTA, -90, 90);
    const minLon = clamp(lon - BBOX_LON_DELTA, -180, 180);
    const maxLon = clamp(lon + BBOX_LON_DELTA, -180, 180);

    const embedUrl = new URL('/export/embed.html', OSM_ORIGIN);
    embedUrl.searchParams.set(
      'bbox',
      `${minLon.toFixed(6)},${minLat.toFixed(6)},${maxLon.toFixed(6)},${maxLat.toFixed(6)}`
    );
    embedUrl.searchParams.set('layer', 'mapnik');
    embedUrl.searchParams.set('marker', `${lat},${lon}`);

    const viewUrl = new URL('/', OSM_ORIGIN);
    viewUrl.searchParams.set('mlat', String(lat));
    viewUrl.searchParams.set('mlon', String(lon));
    viewUrl.hash = `map=16/${lat}/${lon}`;

    const directionsUrl = new URL('/directions', OSM_ORIGIN);
    directionsUrl.searchParams.set('to', `${lat},${lon}`);
    directionsUrl.hash = `map=15/${lat}/${lon}`;

    return {
      embedUrl: assertSafeOsmUrl(embedUrl),
      viewUrl: assertSafeOsmUrl(viewUrl),
      directionsUrl: assertSafeOsmUrl(directionsUrl),
      providerName: this.providerName,
      attributionText: OSM_ATTRIBUTION_TEXT,
      attributionUrl: assertSafeOsmUrl(new URL(OSM_ATTRIBUTION_URL)),
    };
  }

  resolveFallbackSearchUrl(query: string): MapFallbackSearch | null {
    const trimmed = query.trim();
    if (!trimmed) {
      return null;
    }

    const searchUrl = new URL('/search', OSM_ORIGIN);
    searchUrl.searchParams.set('query', trimmed);

    return {
      searchUrl: assertSafeOsmUrl(searchUrl),
      providerName: this.providerName,
      attributionText: OSM_ATTRIBUTION_TEXT,
      attributionUrl: assertSafeOsmUrl(new URL(OSM_ATTRIBUTION_URL)),
    };
  }
}

export const mapProvider: MapProvider = new OpenStreetMapEmbedProvider();
