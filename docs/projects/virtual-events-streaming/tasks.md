# Tareas del Proyecto: Eventos Virtuales — Sala y Transmisión Embebida

Leyenda de estado: `[ ]` Pendiente · `[/]` En progreso · `[x]` Completada

## Resumen de Esfuerzo

| Fase | Tareas | Esfuerzo Estimado |
| :--- | :--- | :--- |
| Fase 1: Dominio, Seed y Puerto `StreamingProvider` | T-01, T-02 | 3.5 h |
| Fase 2: UI de Sala Virtual, Integración y Build | T-03, T-04, T-05 | 5.0 h |
| Fase 3: Verificación Integral | T-06 | 1.5 h |
| **Total** | **6 tareas** | **10 h (Talla M)** |

---

## Backlog Detallado

### [x] T-01: Extender modelo de dominio con `EventVirtualAccess` y actualizar datos semilla
- **Área:** Desarrollo / Ops
- **Esfuerzo:** S (1.5 h)
- **Dependencias:** Ninguna
- **Descripción:** Agregar `EventStreamStatus` (`'en-vivo' | 'proximo' | 'finalizado'`), `EventStreamPlatform` (`'youtube' | 'jitsi' | 'external'`), `EventVirtualAccess` y los validadores puros (`isValidStreamStatus`, `isValidStreamPlatform`, `isSafeHttpsUrl`, `isValidVirtualAccess`) en `apps/web/src/domain/events/event.types.ts`. Extender `EventItem` y `CreateEventInput` con `virtualAccess?: EventVirtualAccess`. Actualizar `SEED_EVENTS`, `cloneEvent` y `create` en `apps/web/src/infrastructure/db/in-memory-event.repository.ts` para poblar los eventos `remoto` e `hibrido` cubriendo los 3 estados (`en-vivo`, `proximo`, `finalizado`) y mantener `presencial` sin `virtualAccess`.
- **Criterios de Aceptación:**
  - [x] `EventItem` y `CreateEventInput` soportan `virtualAccess?: EventVirtualAccess` sin romper `/`, `/events/[id]` ni `/api/events`.
  - [x] `isSafeHttpsUrl` rechaza `http:`, `javascript:`, `data:` y URLs malformadas; `isValidVirtualAccess` valida plataforma, estado y URL externa HTTPS.
  - [x] `SEED_EVENTS` incluye al menos un evento `en-vivo` (`evt-nerdearla-latam`, híbrido/YouTube), uno `proximo` (`evt-ux-latam-remoto`, remoto/Jitsi) y uno `finalizado` (`evt-web-standards-cdmx`, híbrido/YouTube), mientras `evt-fintech-bogota` (`presencial`) permanece sin `virtualAccess`.
  - [x] `cloneEvent` realiza copia profunda de `virtualAccess` para evitar mutaciones compartidas en memoria.

### [x] T-02: Implementar puerto `StreamingProvider` y adaptador gratuito `OpenStreamingEmbedProvider`
- **Área:** Desarrollo / Contabilidad
- **Esfuerzo:** S (2 h)
- **Dependencias:** T-01
- **Descripción:** Crear el puerto portable `apps/web/src/domain/streaming/streaming-provider.ts` (`StreamingProvider`, `ResolvedStreamData`) y el adaptador gratuito sin API keys `apps/web/src/infrastructure/streaming/open-streaming.provider.ts` (`OpenStreamingEmbedProvider`). Debe construir URLs de embed exclusivamente mediante `new URL(...)` y allowlist estricta HTTPS para YouTube No-Cookie (`www.youtube-nocookie.com/embed/<id>?rel=0`) y Jitsi Meet (`meet.jit.si/<room>`), además de modo `external` (`embedUrl: null`) con enlace externo validado y atributos mínimos de `sandbox` y `allow` por plataforma.
- **Criterios de Aceptación:**
  - [x] Ningún componente Astro construye URLs de YouTube o Jitsi directamente; toda resolución pasa por `StreamingProvider`.
  - [x] Valida `roomOrVideoId` con regex estricto (YouTube 11 chars `[a-zA-Z0-9_-]`, Jitsi 3-80 chars `[a-zA-Z0-9_-]`); si falla o no es embebible, hace fallback limpio a `canEmbed: false` manteniendo `externalUrl` validado.
  - [x] Retorna `null` si `externalUrl` no es `https:` válido o si `virtualAccess` no pasa validación de dominio.
  - [x] Funciona con $0 costo operativo, sin variables de entorno, sin API keys y sin nuevas dependencias en `package.json`.

### [x] T-03: Crear componente accesible `EventVirtualRoom.astro` con fachada ligera
- **Área:** Desarrollo / Marketing / Ops
- **Esfuerzo:** M (2.5 h)
- **Dependencias:** T-02
- **Descripción:** Consultar `modern-web-guidance` antes de escribir HTML/CSS/JS cliente. Crear `apps/web/src/components/EventVirtualRoom.astro` consumiendo `StreamingProvider` para renderizar la experiencia de sala virtual en eventos `remoto` e `hibrido`. Debe soportar los estados `en-vivo`, `proximo`, `finalizado` y el fallback sin `virtualAccess` válido. Implementar una fachada interactiva ligera (`aspect-video` para CLS = 0) que monte el `<iframe>` sandboxed bajo demanda al hacer clic en `"Cargar transmisión"` / `"Entrar a la sala"` (protegiendo LCP e INP), junto con zona horaria LATAM, notas de acceso y enlace externo `rel="noopener noreferrer"`.
- **Criterios de Aceptación:**
  - [x] Se consultó `modern-web-guidance` antes de implementar UI/CSS/JS cliente.
  - [x] Muestra indicador de estado accesible (`En vivo`, `Próximo`, `Finalizado`) con texto explícito y contraste WCAG 2.1 AA (sin depender solo del color).
  - [x] En `en-vivo` (y grabación `youtube` en `finalizado`), la fachada `aspect-video` permite cargar bajo demanda el `<iframe>` con `sandbox`, `referrerpolicy="no-referrer"`, `loading="lazy"` y `title` descriptivo; no carga iframes de terceros en el render inicial.
  - [x] En `proximo`, muestra sala de espera con horario/zona horaria LATAM, notas de acceso y enlace anticipado sin montar un `<iframe>` prematuro.
  - [x] En ausencia de `virtualAccess` válido o plataforma `external`, muestra fallback limpio con enlace externo o guía de conexión sin `<iframe>` roto.
  - [x] 100% operable por teclado con foco visible y HTML semántico.

### [x] T-04: Integrar `EventVirtualRoom.astro` en `/events/[id]`, limpiar duplicación en `EventLocationMap.astro` y mejorar catálogo `/`
- **Área:** Desarrollo / Marketing
- **Esfuerzo:** M (2 h)
- **Dependencias:** T-03
- **Descripción:** Actualizar `apps/web/src/pages/events/[id].astro` para renderizar `EventVirtualRoom.astro` en eventos `remoto` e `hibrido`, y `EventLocationMap.astro` únicamente en `presencial` e `hibrido`. Refactorizar `apps/web/src/components/EventLocationMap.astro` para eliminar el bloque duplicado de acceso remoto ahora gestionado por `EventVirtualRoom.astro`. Actualizar `apps/web/src/pages/index.astro` para mostrar un badge sutil `"En vivo"` cuando `event.virtualAccess?.status === 'en-vivo'` y ajustar el CTA de cada tarjeta según modalidad (`"Ver detalle y sala virtual →"`, `"Ver detalle, mapa y sala →"`, `"Ver detalle y ubicación →"`).
- **Criterios de Aceptación:**
  - [x] En `/events/evt-ux-latam-remoto` (`remoto`): se renderiza solo `EventVirtualRoom.astro` (sin `EventLocationMap.astro`).
  - [x] En `/events/evt-nerdearla-latam` y `/events/evt-web-standards-cdmx` (`hibrido`): se renderizan `EventVirtualRoom.astro` y `EventLocationMap.astro` (solo sede presencial) sin bloques remotos duplicados.
  - [x] En `/events/evt-fintech-bogota` (`presencial`): se renderiza solo `EventLocationMap.astro` sin regresiones.
  - [x] En `/`: el evento `en-vivo` muestra badge accesible `"En vivo"` y cada tarjeta presenta el CTA contextual según modalidad.

### [x] T-05: Validación estática y de build del monorepo
- **Área:** Desarrollo
- **Esfuerzo:** XS (0.5 h)
- **Dependencias:** T-04
- **Descripción:** Ejecutar verificación de tipos TypeScript/Astro y compilación de producción para confirmar cero regresiones y cero dependencias agregadas.
- **Criterios de Aceptación:**
  - [x] `pnpm --filter @eventify/web check` pasa sin errores ni warnings críticos.
  - [x] `pnpm --filter @eventify/web build` compila correctamente.
  - [x] Cero dependencias nuevas agregadas en `package.json`.

### [/] T-06: Verificación integral con Chrome DevTools (`chrome-verifier`)
- **Área:** Desarrollo / Ops
- **Esfuerzo:** S (1.5 h)
- **Dependencias:** T-05
- **Descripción:** Auditar flujos reales en navegador con `chrome-verifier` sobre `http://localhost:4321` (desktop y mobile): catálogo `/` (badge `"En vivo"` y CTAs contextuales), evento híbrido `en-vivo` (`evt-nerdearla-latam`, incluyendo activación de fachada y atributos de seguridad del `<iframe>`), evento remoto `proximo` (`evt-ux-latam-remoto`), evento híbrido `finalizado` (`evt-web-standards-cdmx`) y evento `presencial` (`evt-fintech-bogota`).
- **Criterios de Aceptación:**
  - [ ] Auditado por `chrome-verifier` en `http://localhost:4321` (desktop y mobile).
  - [ ] Verificados los 3 estados (`en-vivo`, `proximo`, `finalizado`), activación bajo demanda del `<iframe>` sandboxed y cero regresiones en `presencial` y `404`.
  - [ ] 0 errores de consola y red durante los flujos válidos.
  - [ ] Reporte de las 3 *ilities* (**Security**, **Usability**, **Portability**) registrado en `progress.md`.
