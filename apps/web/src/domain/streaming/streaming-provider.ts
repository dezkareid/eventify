import type { EventStreamPlatform, EventVirtualAccess } from '../events/event.types';

export interface ResolvedStreamData {
  readonly platform: EventStreamPlatform;
  readonly providerName: string;
  readonly canEmbed: boolean;
  readonly embedUrl: string | null;
  readonly externalUrl: string;
  readonly iframeSandbox: string | null;
  readonly iframeAllow: string | null;
  readonly privacyNotice: string;
}

/**
 * Puerto de dominio para resolucion de salas y transmisiones virtuales (Portability).
 * Desacopla los componentes Astro de proveedores concretos (YouTube, Jitsi u otros).
 */
export interface StreamingProvider {
  readonly providerName: string;
  resolveStreamData(access: EventVirtualAccess): ResolvedStreamData | null;
}
