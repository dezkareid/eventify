export type EventModality = 'presencial' | 'remoto' | 'hibrido';

export type EventCategory = 'tecnologia' | 'diseno' | 'negocios' | 'comunidad';

export type EventStreamStatus = 'en-vivo' | 'proximo' | 'finalizado';

export type EventStreamPlatform = 'youtube' | 'jitsi' | 'external';

export interface EventGeoLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly address: string;
}

export interface EventVirtualAccess {
  readonly platform: EventStreamPlatform;
  readonly platformLabel: string;
  readonly status: EventStreamStatus;
  readonly externalUrl: string;
  readonly roomOrVideoId?: string;
  readonly accessNotes?: string;
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
  readonly virtualAccess?: EventVirtualAccess;
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
  readonly virtualAccess?: EventVirtualAccess;
}

const VALID_MODALITIES: ReadonlySet<string> = new Set<EventModality>([
  'presencial',
  'remoto',
  'hibrido',
]);

const VALID_STREAM_STATUSES: ReadonlySet<string> = new Set<EventStreamStatus>([
  'en-vivo',
  'proximo',
  'finalizado',
]);

const VALID_STREAM_PLATFORMS: ReadonlySet<string> = new Set<EventStreamPlatform>([
  'youtube',
  'jitsi',
  'external',
]);

export function isValidModality(value: string): value is EventModality {
  return VALID_MODALITIES.has(value);
}

export function isValidStreamStatus(value: string): value is EventStreamStatus {
  return VALID_STREAM_STATUSES.has(value);
}

export function isValidStreamPlatform(value: string): value is EventStreamPlatform {
  return VALID_STREAM_PLATFORMS.has(value);
}

export function isSafeHttpsUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

export function isValidVirtualAccess(
  access?: EventVirtualAccess | null
): access is EventVirtualAccess {
  if (!access) {
    return false;
  }

  return (
    isValidStreamPlatform(access.platform) &&
    isValidStreamStatus(access.status) &&
    typeof access.platformLabel === 'string' &&
    access.platformLabel.trim().length > 0 &&
    typeof access.externalUrl === 'string' &&
    isSafeHttpsUrl(access.externalUrl)
  );
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
