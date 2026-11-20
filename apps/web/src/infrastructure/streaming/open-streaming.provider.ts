import { isValidVirtualAccess, type EventVirtualAccess } from '../../domain/events/event.types';
import type {
  ResolvedStreamData,
  StreamingProvider,
} from '../../domain/streaming/streaming-provider';

const YOUTUBE_EMBED_HOST = 'www.youtube-nocookie.com';
const YOUTUBE_EMBED_ORIGIN = `https://${YOUTUBE_EMBED_HOST}`;
const YOUTUBE_VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

const JITSI_EMBED_HOST = 'meet.jit.si';
const JITSI_EMBED_ORIGIN = `https://${JITSI_EMBED_HOST}`;
const JITSI_ROOM_ID_REGEX = /^[a-zA-Z0-9_-]{3,80}$/;

function assertSafeEmbedUrl(url: URL, expectedHost: string): string {
  if (url.protocol !== 'https:' || url.hostname !== expectedHost) {
    throw new Error(`URL fuera de la allowlist de streaming (${expectedHost}).`);
  }
  return url.toString();
}

export class OpenStreamingEmbedProvider implements StreamingProvider {
  readonly providerName = 'OpenStreaming';

  resolveStreamData(access: EventVirtualAccess): ResolvedStreamData | null {
    if (!isValidVirtualAccess(access)) {
      return null;
    }

    const externalUrl = new URL(access.externalUrl.trim()).toString();
    const trimmedId = access.roomOrVideoId?.trim() ?? '';

    if (access.platform === 'youtube') {
      if (YOUTUBE_VIDEO_ID_REGEX.test(trimmedId)) {
        const embedUrl = new URL(`/embed/${trimmedId}`, YOUTUBE_EMBED_ORIGIN);
        embedUrl.searchParams.set('rel', '0');
        embedUrl.searchParams.set('modestbranding', '1');

        return {
          platform: 'youtube',
          providerName: access.platformLabel.trim() || 'YouTube',
          canEmbed: true,
          embedUrl: assertSafeEmbedUrl(embedUrl, YOUTUBE_EMBED_HOST),
          externalUrl,
          iframeSandbox: 'allow-scripts allow-same-origin allow-presentation allow-popups',
          iframeAllow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
          privacyNotice:
            'Reproductor en modo de privacidad mejorada (youtube-nocookie.com). Se carga solo al interactuar.',
        };
      }

      return {
        platform: 'youtube',
        providerName: access.platformLabel.trim() || 'YouTube',
        canEmbed: false,
        embedUrl: null,
        externalUrl,
        iframeSandbox: null,
        iframeAllow: null,
        privacyNotice: 'Enlace externo verificado por HTTPS.',
      };
    }

    if (access.platform === 'jitsi') {
      if (JITSI_ROOM_ID_REGEX.test(trimmedId)) {
        const embedUrl = new URL(`/${trimmedId}`, JITSI_EMBED_ORIGIN);

        return {
          platform: 'jitsi',
          providerName: access.platformLabel.trim() || 'Jitsi Meet',
          canEmbed: true,
          embedUrl: assertSafeEmbedUrl(embedUrl, JITSI_EMBED_HOST),
          externalUrl,
          iframeSandbox: 'allow-scripts allow-same-origin allow-forms allow-popups allow-presentation',
          iframeAllow: 'camera; microphone; fullscreen; display-capture; autoplay',
          privacyNotice:
            'Sala interactiva abierta vía Jitsi Meet (meet.jit.si). Se carga solo cuando decidas entrar.',
        };
      }

      return {
        platform: 'jitsi',
        providerName: access.platformLabel.trim() || 'Jitsi Meet',
        canEmbed: false,
        embedUrl: null,
        externalUrl,
        iframeSandbox: null,
        iframeAllow: null,
        privacyNotice: 'Enlace externo verificado por HTTPS.',
      };
    }

    return {
      platform: 'external',
      providerName: access.platformLabel.trim() || 'Plataforma externa',
      canEmbed: false,
      embedUrl: null,
      externalUrl,
      iframeSandbox: null,
      iframeAllow: null,
      privacyNotice: 'Acceso directo en plataforma externa mediante enlace HTTPS verificado.',
    };
  }
}

export const streamingProvider: StreamingProvider = new OpenStreamingEmbedProvider();
