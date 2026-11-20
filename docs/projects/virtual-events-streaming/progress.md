# Progreso del Proyecto: Eventos Virtuales — Sala y Transmisión Embebida

- **Estado actual:** En verificación (`T-01` a `T-05` completadas; `T-06` en progreso)
- **Última actualización:** 2026-11-20

---

## 1. Registro de Implementación

| Fecha | Tarea | Resumen de Cambios | Archivos Tocados |
| :--- | :--- | :--- | :--- |
| 2026-11-20 | Inicio | Documentos de proyecto creados por `project-planner` y arquitectura/C4 Model actualizados con `StreamingProvider`, `OpenStreamingEmbedProvider` y `EventVirtualRoom.astro` | `docs/projects/virtual-events-streaming/plan.md`, `docs/projects/virtual-events-streaming/tasks.md`, `docs/projects/virtual-events-streaming/progress.md`, `docs/architecture/overview.md`, `docs/architecture/c4-model.md` |
| 2026-11-20 | T-01 | Extendido dominio con `EventStreamStatus`, `EventStreamPlatform`, `EventVirtualAccess` y validadores puros (`isSafeHttpsUrl`, `isValidVirtualAccess`). Poblado `SEED_EVENTS` con estados `en-vivo`, `proximo` y `finalizado`, y copia profunda en `cloneEvent`. | `apps/web/src/domain/events/event.types.ts`, `apps/web/src/infrastructure/db/in-memory-event.repository.ts` |
| 2026-11-20 | T-02 | Creado puerto `StreamingProvider` y adaptador gratuito `OpenStreamingEmbedProvider` con allowlist HTTPS (`www.youtube-nocookie.com`, `meet.jit.si`), regex estricto de IDs y fallback seguro. | `apps/web/src/domain/streaming/streaming-provider.ts`, `apps/web/src/infrastructure/streaming/open-streaming.provider.ts` |
| 2026-11-20 | T-03 | Creado `EventVirtualRoom.astro` con fachada interactiva ligera (`aspect-video`, carga bajo demanda vía `document.createElement('iframe')` sandboxed), badges accesibles, sala de espera `proximo`, `<details>`/`<summary>` nativo y container queries. | `apps/web/src/components/EventVirtualRoom.astro`, `apps/web/src/styles/global.css` |
| 2026-11-20 | T-04 | Integrado `EventVirtualRoom.astro` en `/events/[id].astro`, eliminado bloque remoto duplicado en `EventLocationMap.astro` y agregados badge `"En vivo"` y CTAs contextuales en `/`. | `apps/web/src/pages/events/[id].astro`, `apps/web/src/components/EventLocationMap.astro`, `apps/web/src/pages/index.astro` |
| 2026-11-20 | T-05 | Validado `pnpm --filter @eventify/web check` (0 errors, 0 warnings, 0 hints) y `pnpm --filter @eventify/web build` (exit 0) con 0 dependencias nuevas. | — |

---

## 2. Patrones de `modern-web-guidance` Aplicados

- **`privacy` (Façade Pattern & Privacy-Preserving Embeds):** Uso de `www.youtube-nocookie.com` y carga del `<iframe>` únicamente tras interacción explícita del usuario (0 requests a terceros en carga inicial, protección de LCP/INP y privacidad). Construcción segura con `document.createElement('iframe')`, `sandbox` acotado y `referrerpolicy="no-referrer"` (sin `innerHTML` ni `set:html`).
- **`html` (Semántica, Accesibilidad y Native Disclosures):** Indicadores de estado con texto explícito + contraste WCAG AA (nunca solo color), puntos decorativos con `aria-hidden="true"`, `<details>`/`<summary>` nativo para recomendaciones técnicas de conexión sin JS, `aspect-video` para CLS = 0 y `addEventListener()` en lugar de manejadores inline.
- **`size-aware-styling` (Container Queries):** `.event-virtual-room-container` con `container-type: inline-size` y `@container (min-width: 34rem)` para adaptar el bloque de metadatos de la sala según el espacio del contenedor.

---

## 3. Verificación (`chrome-verifier` — Chrome DevTools MCP)

- **Estado:** Bloqueada temporalmente por entorno (Chrome DevTools MCP no expuesto en la sesión actual); verificación SSR/HTTP completada sin errores.
- **URL verificada:** `http://localhost:4322`
- **Smoke test SSR/HTTP (7/7 PASS):**
  - `GET /` (`200`): badge `"En vivo"` en `evt-nerdearla-latam` y CTAs contextuales por modalidad presentes.
  - `GET /events/evt-nerdearla-latam` (`200`): `EventVirtualRoom` (`En vivo`, fachada YouTube No-Cookie sin `<iframe>` inicial) + `EventLocationMap` (solo sede presencial, sin bloque remoto duplicado) + `<details>` nativo.
  - `GET /events/evt-ux-latam-remoto` (`200`): solo `EventVirtualRoom` (`Próximo`, sala de espera, enlace seguro `meet.jit.si`, sin mapa físico ni `<iframe>` prematuro).
  - `GET /events/evt-web-standards-cdmx` (`200`): `EventVirtualRoom` (`Finalizado`, fachada `"Reproducir grabación"`) + `EventLocationMap`.
  - `GET /events/evt-fintech-bogota` (`200`): solo `EventLocationMap`, sin `EventVirtualRoom`.
  - `GET /events/no-existe` (`404`): página semántica de error 404.
  - `GET /api/events?modality=remoto` (`200`): JSON válido con `virtualAccess`.
- **Resultado por *Ility*:**
  - **Security:** Validado en código y SSR (allowlist HTTPS, `isSafeHttpsUrl`, `sandbox`, `referrerpolicy="no-referrer"`, cero `set:html`/`innerHTML`); pendiente auditoría runtime en Chrome DevTools MCP.
  - **Usability:** Validado en código y SSR (`aspect-video`, badges con texto explícito, `<details>` nativo, container queries); pendiente auditoría visual desktop/mobile y árbol a11y en Chrome DevTools MCP.
  - **Portability:** Validado (`StreamingProvider` desacoplado de `OpenStreamingEmbedProvider`, 0 dependencias npm nuevas).
- **Hallazgos / Observaciones:**
  - El subagente `chrome-verifier` reportó que el servidor MCP `chrome-devtools` no está expuesto en esta sesión. Para cerrar `T-06`, habilitar/conectar Chrome DevTools MCP y re-ejecutar `chrome-verifier` sobre `http://localhost:4322`.
