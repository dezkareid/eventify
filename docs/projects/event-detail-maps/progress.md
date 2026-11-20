# Progreso del Proyecto: Vista de Detalle de Evento con Mapa Gratuito (OpenStreetMap)

- **Estado actual:** En verificación (`T-01` a `T-05` completadas; iniciando `T-06` con `chrome-verifier`)
- **Última actualización:** 2026-11-20

---

## 1. Registro de Implementación

| Fecha | Tarea | Resumen de Cambios | Archivos Tocados |
| :--- | :--- | :--- | :--- |
| 2026-11-19 | Planificación inicial | Gate de Negocio validado, documentos base del proyecto creados y arquitectura actualizada por `project-planner`. | `docs/projects/event-detail-maps/plan.md`, `docs/projects/event-detail-maps/tasks.md`, `docs/projects/event-detail-maps/progress.md`, `docs/architecture/overview.md`, `docs/architecture/c4-model.md` |
| 2026-11-20 | Refinamiento a mapa gratuito | Plan actualizado a solución 100% gratuita y sin API key (**OpenStreetMap Embed** detrás del puerto `MapProvider`), incorporando matriz comparativa de opciones gratuitas y ajuste de esfuerzo a 9 h. Arquitectura y C4 Model sincronizados. | `docs/projects/event-detail-maps/plan.md`, `docs/projects/event-detail-maps/tasks.md`, `docs/projects/event-detail-maps/progress.md`, `docs/architecture/overview.md`, `docs/architecture/c4-model.md` |
| 2026-11-20 | T-01 | Agregado `EventGeoLocation` e `isValidGeoCoordinates` en dominio; coordenadas verificadas en `SEED_EVENTS` para eventos presenciales/híbridos y preservación sanitizada en `create()`. | `apps/web/src/domain/events/event.types.ts`, `apps/web/src/infrastructure/db/in-memory-event.repository.ts` |
| 2026-11-20 | T-02 | Creado puerto portable `MapProvider` y adaptador gratuito `OpenStreetMapEmbedProvider` con allowlist HTTPS (`www.openstreetmap.org`), `bbox` acotado y fallback de búsqueda segura. | `apps/web/src/domain/maps/map-provider.ts`, `apps/web/src/infrastructure/maps/openstreetmap.provider.ts` |
| 2026-11-20 | T-03 | Creado componente `EventLocationMap.astro` con soporte `presencial`, `hibrido`, `remoto` y fallback sin coordenadas, `aspect-video`, `loading="lazy"`, `sandbox`, `referrerpolicy="no-referrer"` y atribución ODbL. | `apps/web/src/components/EventLocationMap.astro`, `apps/web/src/styles/global.css` |
| 2026-11-20 | T-04 | Creada página SSR `/events/[id]` con SEO dinámico, validación de `id`, respuesta HTTP `404` accesible y enlaces desde tarjetas en `/` con patrón stretched-link accesible. | `apps/web/src/pages/events/[id].astro`, `apps/web/src/pages/index.astro` |
| 2026-11-20 | T-05 | Ejecutado `pnpm check && pnpm build` con 0 errores, 0 warnings y 0 hints (12 archivos revisados). | Monorepo (`@eventify/web`) |

---

## 2. Patrones de `modern-web-guidance` Aplicados

- **`card` (Stretched-link pattern con `:has()`):** En `apps/web/src/pages/index.astro` y `global.css`, solo el título `<a>` de cada tarjeta tiene `.event-card-link` con `::after` cubriendo el `<article>`, elevando el foco y hover al contenedor mediante `:has(a.event-card-link:focus-visible)` y evitando enlaces duplicados para lectores de pantalla.
- **`responsive-design` (`aspect-ratio`, `@container` y `clamp()`):** Contenedor del mapa con `aspect-video` (**CLS = 0**), `container-type: inline-size` en tarjetas y bloque de ubicación, y tipografía fluida `clamp(1.75rem, 1.25rem + 2vw, 2.75rem)` respetando WCAG 1.4.4 (zoom 200%).
- **`defer-rendering-heavy-content` / Performance:** Carga diferida nativa `loading="lazy"` en el `<iframe>` de OpenStreetMap y **0 KB de JS cliente** adicional para proteger LCP e INP.

---

## 3. Verificación (`chrome-verifier` — Chrome DevTools MCP)

- **Estado:** Parcial (pre-verificación HTTP/SSR aprobada; auditoría en navegador real pendiente por falta de Chrome DevTools MCP conectado en esta sesión)
- **URL verificada:** `http://localhost:4321`, `http://localhost:4321/events/evt-fintech-bogota`, `http://localhost:4321/events/evt-nerdearla-latam`, `http://localhost:4321/events/evt-ux-latam-remoto`, `http://localhost:4321/events/evento-inexistente`
- **Resultado por *Ility* (pre-verificación SSR):**
  - **Security:** Pre-verificado OK — `<iframe>` limitado a `https://www.openstreetmap.org/export/embed.html`, `sandbox="allow-scripts allow-same-origin"`, `referrerpolicy="no-referrer"`, enlaces externos con `rel="noopener noreferrer"`, ruta XSS `/events/<script>...` responde `404` sin inyección.
  - **Usability:** Pre-verificado OK en HTML SSR — único `<h1>` por página, `<title>` y `<meta name="description">` dinámicos, `aspect-video` + `loading="lazy"`, dirección textual y atribución ODbL presentes. *(Pendiente validar foco/teclado, contraste visual y responsive en navegador real con Chrome DevTools MCP)*.
  - **Portability:** Aprobado — puerto `MapProvider` desacoplado, cero dependencias npm nuevas y cero API keys.
- **Hallazgos / Observaciones:**
  - `T-06` permanece en progreso (`[/]`) hasta ejecutar la auditoría final en navegador real con Chrome DevTools MCP (consola, red, interacción por teclado y screenshots desktop/mobile).
