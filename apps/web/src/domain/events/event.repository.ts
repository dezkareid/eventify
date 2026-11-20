import type { CreateEventInput, EventFilter, EventItem } from './event.types';

/**
 * Puerto de dominio para acceso a eventos (Portability).
 * Permite intercambiar la In-Memory Database por una base de datos SQL/NoSQL
 * sin modificar paginas Astro ni endpoints HTTP.
 */
export interface EventRepository {
  findAll(filter?: EventFilter): Promise<readonly EventItem[]>;
  findById(id: string): Promise<EventItem | null>;
  create(input: CreateEventInput): Promise<EventItem>;
}
