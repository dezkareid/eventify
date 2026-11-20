import type { APIRoute } from 'astro';
import { isValidModality } from '../../domain/events/event.types';
import { eventRepository } from '../../infrastructure/db/in-memory-event.repository';

const SECURITY_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store',
} as const;

export const GET: APIRoute = async ({ url }) => {
  const modalityParam = url.searchParams.get('modality');

  if (modalityParam !== null && !isValidModality(modalityParam)) {
    return new Response(
      JSON.stringify({
        error: 'Parametro modality invalido. Valores permitidos: presencial, remoto, hibrido.',
      }),
      {
        status: 400,
        headers: SECURITY_HEADERS,
      }
    );
  }

  const events = await eventRepository.findAll(
    modalityParam !== null && isValidModality(modalityParam)
      ? { modality: modalityParam }
      : undefined
  );

  return new Response(
    JSON.stringify({
      count: events.length,
      events,
    }),
    {
      status: 200,
      headers: SECURITY_HEADERS,
    }
  );
};
