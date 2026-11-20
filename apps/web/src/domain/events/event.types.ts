export type EventModality = 'presencial' | 'remoto' | 'hibrido';

export type EventCategory = 'tecnologia' | 'diseno' | 'negocios' | 'comunidad';

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
}

const VALID_MODALITIES: ReadonlySet<string> = new Set<EventModality>([
  'presencial',
  'remoto',
  'hibrido',
]);

export function isValidModality(value: string): value is EventModality {
  return VALID_MODALITIES.has(value);
}
