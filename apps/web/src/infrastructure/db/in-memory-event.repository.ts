import type { EventRepository } from '../../domain/events/event.repository';
import {
  isValidGeoCoordinates,
  type CreateEventInput,
  type EventFilter,
  type EventItem,
} from '../../domain/events/event.types';

const SEED_EVENTS: EventItem[] = [
  {
    id: 'evt-nerdearla-latam',
    title: 'Nerdearla Frontend Architecture Summit',
    summary:
      'Charlas y talleres practicos sobre arquitectura frontend moderna, agentes de IA y estandares web en LATAM.',
    modality: 'hibrido',
    category: 'tecnologia',
    dateIso: '2026-11-24T10:00:00-03:00',
    timezone: 'ART (UTC-3)',
    location: 'Centro Cultural Konex + Streaming HD',
    city: 'Buenos Aires',
    country: 'Argentina',
    priceUsd: 0,
    capacity: 600,
    registeredCount: 482,
    geo: {
      latitude: -34.6063,
      longitude: -58.4109,
      address: 'Sarmiento 3131, C1196AAG Buenos Aires, Argentina',
    },
  },
  {
    id: 'evt-ux-latam-remoto',
    title: 'Workshop: Accesibilidad y Usabilidad en Escala',
    summary:
      'Sesion 100% remota enfocada en WCAG 2.1 AA, Core Web Vitals y diseno inclusivo para productos digitales.',
    modality: 'remoto',
    category: 'diseno',
    dateIso: '2026-11-28T16:00:00-06:00',
    timezone: 'CST (UTC-6)',
    location: 'Sala Interactiva Eventify Live',
    city: 'Remoto',
    country: 'LATAM',
    priceUsd: 25,
    capacity: 250,
    registeredCount: 190,
  },
  {
    id: 'evt-fintech-bogota',
    title: 'LATAM Cloud & Security Forum',
    summary:
      'Encuentro presencial para lideres de ingenieria, operaciones y seguridad en plataformas de alto trafico.',
    modality: 'presencial',
    category: 'negocios',
    dateIso: '2026-12-03T09:00:00-05:00',
    timezone: 'COT (UTC-5)',
    location: 'Agora Bogota Centro de Convenciones',
    city: 'Bogota',
    country: 'Colombia',
    priceUsd: 49,
    capacity: 300,
    registeredCount: 215,
    geo: {
      latitude: 4.6295,
      longitude: -74.0906,
      address: 'Calle 24 #38-47, Bogota, Colombia',
    },
  },
  {
    id: 'evt-web-standards-cdmx',
    title: 'Meetup: Modern Web Standards & Astro',
    summary:
      'Comunidad abierta sobre rendimiento web, zero-JS por defecto y experiencias hibridas sin lock-in.',
    modality: 'hibrido',
    category: 'comunidad',
    dateIso: '2026-12-10T18:30:00-06:00',
    timezone: 'CST (UTC-6)',
    location: 'Hub Reforma CDMX + Transmision Abierta',
    city: 'Ciudad de Mexico',
    country: 'Mexico',
    priceUsd: 0,
    capacity: 180,
    registeredCount: 134,
    geo: {
      latitude: 19.427,
      longitude: -99.1677,
      address: 'Av. Paseo de la Reforma 222, Juarez, Cuauhtemoc, 06600 Ciudad de Mexico, Mexico',
    },
  },
];

function cloneEvent(item: EventItem): EventItem {
  return item.geo ? { ...item, geo: { ...item.geo } } : { ...item };
}

class InMemoryEventRepository implements EventRepository {
  private readonly events: EventItem[];

  constructor(initialData: readonly EventItem[] = SEED_EVENTS) {
    this.events = initialData.map(cloneEvent);
  }

  async findAll(filter?: EventFilter): Promise<readonly EventItem[]> {
    return this.events
      .filter((event) => {
        if (filter?.modality && event.modality !== filter.modality) {
          return false;
        }
        if (filter?.category && event.category !== filter.category) {
          return false;
        }
        return true;
      })
      .map(cloneEvent);
  }

  async findById(id: string): Promise<EventItem | null> {
    const found = this.events.find((event) => event.id === id);
    return found ? cloneEvent(found) : null;
  }

  async create(input: CreateEventInput): Promise<EventItem> {
    const id = `evt-${crypto.randomUUID().slice(0, 8)}`;
    const sanitizedGeo =
      input.geo && isValidGeoCoordinates(input.geo)
        ? {
            latitude: input.geo.latitude,
            longitude: input.geo.longitude,
            address: input.geo.address.trim(),
          }
        : undefined;

    const created: EventItem = {
      id,
      title: input.title.trim(),
      summary: input.summary.trim(),
      modality: input.modality,
      category: input.category,
      dateIso: input.dateIso,
      timezone: input.timezone.trim(),
      location: input.location.trim(),
      city: input.city.trim(),
      country: input.country.trim(),
      priceUsd: Math.max(0, input.priceUsd),
      capacity: Math.max(1, Math.floor(input.capacity)),
      registeredCount: 0,
      ...(sanitizedGeo ? { geo: sanitizedGeo } : {}),
    };

    this.events.unshift(created);
    return cloneEvent(created);
  }
}

export const eventRepository: EventRepository = new InMemoryEventRepository();
