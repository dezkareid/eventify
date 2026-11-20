export type EventModality = 'presencial' | 'remoto' | 'hibrido';

export type EventCategory = 'tecnologia' | 'diseno' | 'negocios' | 'comunidad';

export interface EventGeoLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly address: string;
}

export interface EventItem {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly modality: EventModality;
  readonly category: EventCategory;
  readonly dateIso: string;
  readonly timezone: string;
  readonly location: string;
  readonly city: string;
  readonly country: string;
  readonly priceUsd: number;
  readonly capacity: number;
  readonly registeredCount: number;
  readonly geo?: EventGeoLocation;
}

export interface EventFilter {
  readonly modality?: EventModality;
  readonly category?: EventCategory;
}

export interface CreateEventInput {
  readonly title: string;
  readonly summary: string;
  readonly modality: EventModality;
  readonly category: EventCategory;
  readonly dateIso: string;
  readonly timezone: string;
  readonly location: string;
  readonly city: string;
  readonly country: string;
  readonly priceUsd: number;
  readonly capacity: number;
  readonly geo?: EventGeoLocation;
}

const VALID_MODALITIES: ReadonlySet<string> = new Set<EventModality>([
  'presencial',
  'remoto',
  'hibrido',
]);

export function isValidModality(value: string): value is EventModality {
  return VALID_MODALITIES.has(value);
}

export function isValidGeoCoordinates(
  geo?: Pick<EventGeoLocation, 'latitude' | 'longitude'> | null
): geo is Pick<EventGeoLocation, 'latitude' | 'longitude'> {
  if (!geo) {
    return false;
  }

  return (
    Number.isFinite(geo.latitude) &&
    Number.isFinite(geo.longitude) &&
    geo.latitude >= -90 &&
    geo.latitude <= 90 &&
    geo.longitude >= -180 &&
    geo.longitude <= 180
  );
}
