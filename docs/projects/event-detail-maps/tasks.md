# Tareas del Proyecto: Página de Detalle de Evento con Mapa de Ubicación

Leyenda de estado: `[ ]` Pendiente · `[/]` En progreso · `[x]` Completada

## Resumen de Esfuerzo

| Fase | Tareas | Esfuerzo Estimado |
| :--- | :--- | :--- |
| Fase 1: Dominio y Adaptadores de Mapas | T-01, T-02 | 3 h |
| Fase 2: UI, Página de Detalle y Modern Web | T-03, T-04, T-05 | 5 h |
| Fase 3: Verificación Integral | T-06 | 2 h |
| **Total** | **6 tareas** | **10 h (Talla M)** |

---

## Backlog Detallado

### [ ] T-01: Extender modelo de dominio de eventos con geolocalización opcional
- **Área:** Desarrollo / Ops
- **Esfuerzo:** S (1.5 h)
- **Dependencias:** Ninguna
- **Descripción:** Agregar `GeoCoordinates` / `geo` opcional en `apps/web/src/domain/events/event.types.ts` (con `latitude`, `longitude`, `address` y helper puro `isValidGeoCoordinates`) y poblar coordenadas verificadas en `SEED_EVENTS` de `in-memory-event.repository.ts` para eventos `presencial` e `hibrido` (dejando `remoto` sin `geo`).
- **Criterios de Aceptación:**
  - [ ] `EventItem` y `CreateEventInput` soportan `geo?: EventGeoLocation` sin romper consumidores actuales.
  - [ ] Validador `isValidGeoCoordinates` rechaza `NaN`, `Infinity`, latitudes fuera de `[-90, 90]` y longitudes fuera de `[-180, 180]`.
  - [ ] Los 3 eventos semilla presenciales/híbridos (`Buenos Aires`, `Bogotá`, `CDMX`) incluyen dirección y coordenadas válidas; el evento remoto (`evt-ux-latam-remoto`) no tiene coordenadas físicas.

### [ ] T-02: Implementar puerto `MapProvider` y adaptadores (Google Maps + fallback OpenStreetMap)
- **Área:** Desarrollo / Contabilidad
- **Esfuerzo:** S (1.5 h)
- **Dependencias:** T-01
- **Descripción:** Crear el puerto portable `apps/web/src/domain/maps/map-provider.ts` y los adaptadores en `apps/web/src/infrastructure/maps/` (`google-maps.provider.ts`, `openstreetmap.provider.ts` y factory `map-provider.factory.ts`) seleccionando Google Maps Embed API cuando `PUBLIC_GOOGLE_MAPS_EMBED_KEY` esté definida y OpenStreetMap como fallback $0. Documentar variable en `.env.example`.
- **Criterios de Aceptación:**
  - [ ] Ningún componente Astro construye URLs de Google Maps directamente; todo pasa por `MapProvider`.
  - [ ] Todas las URLs generadas usan `new URL(...)`, protocolo `https:` y codificación segura de parámetros.
  - [ ] Enlaces externos de "Abrir en Google Maps" / "Cómo llegar" funcionan con o sin API key.
  - [ ] Existe `.env.example` documentando `PUBLIC_GOOGLE_MAPS_EMBED_KEY` (sin secretos reales en el repo).

### [ ] T-03: Crear componente accesible `EventLocationMap.astro`
- **Área:** Desarrollo / Marketing
- **Esfuerzo:** M (2 h)
- **Dependencias:** T-02
- **Descripción:** Consultar `modern-web-guidance` antes de escribir HTML/CSS. Crear `apps/web/src/components/EventLocationMap.astro` con soporte para eventos `presencial`, `hibrido` y `remoto`, contenedor con `aspect-video` (CLS = 0), `<iframe>` seguro (`sandbox`, `loading="lazy"`, `referrerpolicy`, `title` descriptivo) y bloque de dirección + CTA "Cómo llegar".
- **Criterios de Aceptación:**
  - [ ] Se consultó `modern-web-guidance` antes de implementar UI/CSS.
  - [ ] Para `presencial` e `hibrido` con `geo` válido, renderiza dirección, mapa embebido seguro y enlace externo con `rel="noopener noreferrer"`.
  - [ ] Para `remoto`, no renderiza `<iframe>` de mapa y muestra tarjeta clara de acceso remoto y zona horaria.
  - [ ] Para `presencial`/`hibrido` sin `geo` válido, muestra fallback textual sin `<iframe>` roto.
  - [ ] Cumple WCAG 2.1 AA (HTML semántico, contraste, foco visible y navegación por teclado).

### [ ] T-04: Crear página SSR de detalle `/events/[id]` y enlazar catálogo principal
- **Área:** Desarrollo / Marketing / Ops
- **Esfuerzo:** M (2.5 h)
- **Dependencias:** T-03
- **Descripción:** Crear `apps/web/src/pages/events/[id].astro` consumiendo `eventRepository.findById(id)`, mostrando metadatos SEO dinámicos (`title`, `description`), fecha/zona horaria, modalidad, precio, cupos disponibles y `EventLocationMap.astro`. Devolver estado HTTP `404` accesible si el evento no existe. Actualizar `apps/web/src/pages/index.astro` para que cada tarjeta enlace de forma accesible a `/events/${event.id}`.
- **Criterios de Aceptación:**
  - [ ] Navegar desde cualquier tarjeta en `/` lleva a `/events/[id]`.
  - [ ] Un `id` inexistente responde HTTP `404` con vista amigable y enlace de regreso al catálogo.
  - [ ] `<title>` y `<meta name="description">` reflejan dinámicamente el evento consultado.
  - [ ] Incluye breadcrumb o enlace claro "Volver a eventos" navegable por teclado.

### [ ] T-05: Validación estática y de build del monorepo
- **Área:** Desarrollo
- **Esfuerzo:** XS (0.5 h)
- **Dependencias:** T-04
- **Descripción:** Ejecutar validaciones de tipos y compilación de Astro para asegurar integridad de contratos y cero regresiones.
- **Criterios de Aceptación:**
  - [ ] `pnpm --filter @eventify/web astro check` pasa sin errores.
  - [ ] `pnpm --filter @eventify/web build` compila correctamente sin warnings críticos.
  - [ ] Sin nuevas dependencias innecesarias en `package.json`.

### [ ] T-06: Verificación integral con Chrome DevTools (`chrome-verifier`)
- **Área:** Desarrollo / Ops
- **Esfuerzo:** S (2 h)
- **Dependencias:** T-05
- **Descripción:** Auditar flujos reales en navegador con `chrome-verifier` sobre `http://localhost:4321`: navegación desde `/` a evento `presencial`, `hibrido`, `remoto` y ruta `404`; validar accesibilidad, consola, red, CLS y atributos de seguridad del `<iframe>`.
- **Criterios de Aceptación:**
  - [ ] Auditado por `chrome-verifier` en `http://localhost:4321` (desktop y mobile).
  - [ ] Verificado mapa visible en `presencial` e `hibrido`, y ausencia de mapa en `remoto`.
  - [ ] 0 errores de consola y red (excepto `404` esperado en prueba de evento inexistente).
  - [ ] Reporte de las 3 *ilities* (Security, Usability, Portability) registrado en `progress.md`.
