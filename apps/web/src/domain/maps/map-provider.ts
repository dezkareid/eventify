import type { EventGeoLocation } from '../events/event.types';

export interface ResolvedMapData {
  readonly embedUrl: string;
  readonly viewUrl: string;
  readonly directionsUrl: string;
  readonly providerName: string;
  readonly attributionText: string;
  readonly attributionUrl: string;
}

export interface MapFallbackSearch {
  readonly searchUrl: string;
  readonly providerName: string;
  readonly attributionText: string;
  readonly attributionUrl: string;
}

/**
 * Puerto de dominio para resolucion de mapas (Portability).
 * Desacopla las vistas Astro del proveedor concreto (OpenStreetMap u otros).
 */
export interface MapProvider {
  readonly providerName: string;
  resolveMapData(geo: EventGeoLocation): ResolvedMapData | null;
  resolveFallbackSearchUrl(query: string): MapFallbackSearch | null;
}
