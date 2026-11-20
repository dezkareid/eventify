# Tareas del Proyecto: Vista de Detalle de Evento con Mapa Gratuito (OpenStreetMap)

Leyenda de estado: `[ ]` Pendiente · `[/]` En progreso · `[x]` Completada

## Resumen de Esfuerzo

| Fase | Tareas | Esfuerzo Estimado |
| :--- | :--- | :--- |
| Fase 1: Dominio y Adaptador OpenStreetMap | T-01, T-02 | 3 h |
| Fase 2: UI, Página de Detalle y Build | T-03, T-04, T-05 | 4.5 h |
| Fase 3: Verificación Integral | T-06 | 1.5 h |
| **Total** | **6 tareas** | **9 h (Talla M)** |

---

## Backlog Detallado

### [x] T-01: Extender modelo de dominio de eventos con geolocalización opcional
- **Área:** Desarrollo / Ops
- **Esfuerzo:** S (1.5 h)
- **Dependencias:** Ninguna
- **Descripción:** Agregar `EventGeoLocation` (`latitude`, `longitude`, `address`) y helper puro `isValidGeoCoordinates` en `apps/web/src/domain/events/event.types.ts`, y poblar coordenadas reales verificadas en `SEED_EVENTS` de `apps/web/src/infrastructure/db/in-memory-event.repository.ts` para los eventos `presencial` e `hibrido` (dejando `remoto` sin `geo`).
- **Criterios de Aceptación:**
  - [x] `EventItem` y `CreateEventInput` soportan `geo?: EventGeoLocation` sin romper consumidores actuales (`/`, `/api/events`).
  - [x] `isValidGeoCoordinates` rechaza `NaN`, `Infinity`, latitudes fuera de `[-90, 90]` y longitudes fuera de `[-180, 180]`.
  - [x] Los 3 eventos semilla presenciales/híbridos (`Buenos Aires`, `Bogotá`, `CDMX`) incluyen dirección y coordenadas válidas; el evento remoto (`evt-ux-latam-remoto`) no tiene coordenadas físicas.

### [x] T-02: Implementar puerto `MapProvider` y adaptador gratuito `OpenStreetMapEmbedProvider`
- **Área:** Desarrollo / Contabilidad
- **Esfuerzo:** S (1.5 h)
- **Dependencias:** T-01
- **Descripción:** Crear el puerto portable `apps/web/src/domain/maps/map-provider.ts` y el adaptador `apps/web/src/infrastructure/maps/openstreetmap.provider.ts` (100% gratuito, sin API key ni dependencias externas). Debe calcular un `bbox` acotado a `[-180, 180]` / `[-90, 90]` para `https://www.openstreetmap.org/export/embed.html`, además de generar enlaces externos seguros ("Ver en OpenStreetMap", "Cómo llegar" y fallback de búsqueda por texto cuando no haya coordenadas).
- **Criterios de Aceptación:**
  - [x] Ningún componente Astro construye URLs de OpenStreetMap directamente; todo pasa por el puerto `MapProvider`.
  - [x] Todas las URLs generadas usan `new URL(...)`, protocolo `https:` y allowlist estricta a `www.openstreetmap.org`.
  - [x] Funciona sin variables de entorno, sin API keys y sin nuevas dependencias en `package.json`.
  - [x] Expone un método de fallback de búsqueda segura por texto cuando un evento presencial/híbrido carece de `geo` válido.

### [x] T-03: Crear componente accesible `EventLocationMap.astro`
- **Área:** Desarrollo / Marketing
- **Esfuerzo:** M (2 h)
- **Dependencias:** T-02
- **Descripción:** Consultar `modern-web-guidance` antes de escribir HTML/CSS. Crear `apps/web/src/components/EventLocationMap.astro` con soporte para eventos `presencial`, `hibrido`, `remoto` y fallback sin coordenadas. Usar contenedor `aspect-video` (CLS = 0), `<iframe>` aislado (`sandbox="allow-scripts allow-same-origin"`, `loading="lazy"`, `referrerpolicy="no-referrer"`, `title` descriptivo), bloque de dirección textual, atribución a OpenStreetMap y enlaces externos accesibles.
- **Criterios de Aceptación:**
  - [x] Se consultó `modern-web-guidance` antes de implementar UI/CSS.
  - [x] Para `presencial` e `hibrido` con `geo` válido, renderiza dirección, mapa embebido de OpenStreetMap seguro y enlaces externos con `rel="noopener noreferrer"`.
  - [x] Para `hibrido`, muestra tanto la ubicación física con mapa como el bloque de acceso remoto.
  - [x] Para `remoto`, no renderiza `<iframe>` de mapa y muestra tarjeta clara de acceso virtual y zona horaria LATAM.
  - [x] Para `presencial`/`hibrido` sin `geo` válido, muestra fallback textual + enlace de búsqueda sin `<iframe>` roto.
  - [x] Cumple WCAG 2.1 AA (HTML semántico, contraste, foco visible y navegación por teclado).

### [x] T-04: Crear página SSR de detalle `/events/[id]` y enlazar catálogo principal
- **Área:** Desarrollo / Marketing / Ops
- **Esfuerzo:** M (2 h)
- **Dependencias:** T-03
- **Descripción:** Crear `apps/web/src/pages/events/[id].astro` consumiendo `eventRepository.findById(id)`, mostrando metadatos SEO dinámicos (`title`, `description`), fecha/zona horaria LATAM, modalidad, precio, cupos disponibles y `EventLocationMap.astro`. Devolver estado HTTP `404` accesible si el evento no existe. Actualizar `apps/web/src/pages/index.astro` para que cada tarjeta enlace de forma accesible a `/events/${event.id}`.
- **Criterios de Aceptación:**
  - [x] Navegar desde cualquier tarjeta en `/` lleva a `/events/[id]`.
  - [x] Un `id` inexistente responde HTTP `404` con vista amigable y enlace de regreso al catálogo.
  - [x] `<title>` y `<meta name="description">` reflejan dinámicamente el título, ciudad/modalidad y resumen del evento.
  - [x] Incluye breadcrumb o enlace claro "Volver a eventos" navegable por teclado.

### [x] T-05: Validación estática y de build del monorepo
- **Área:** Desarrollo
- **Esfuerzo:** XS (0.5 h)
- **Dependencias:** T-04
- **Descripción:** Ejecutar validaciones de tipos y compilación de Astro para asegurar integridad de contratos y cero regresiones.
- **Criterios de Aceptación:**
  - [x] `pnpm --filter @eventify/web check` (o `astro check`) pasa sin errores.
  - [x] `pnpm --filter @eventify/web build` compila correctamente sin warnings críticos.
  - [x] Cero nuevas dependencias agregadas en `package.json`.

### [/] T-06: Verificación integral con Chrome DevTools (`chrome-verifier`)
- **Área:** Desarrollo / Ops
- **Esfuerzo:** S (1.5 h)
- **Dependencias:** T-05
- **Descripción:** Auditar flujos reales en navegador con `chrome-verifier` sobre `http://localhost:4321`: navegación desde `/` a evento `presencial`, `hibrido`, `remoto` y ruta `404`; validar accesibilidad, consola, red, CLS y atributos de seguridad del `<iframe>` de OpenStreetMap.
- **Criterios de Aceptación:**
  - [ ] Auditado por `chrome-verifier` en `http://localhost:4321` (desktop y mobile).
  - [ ] Verificado mapa OpenStreetMap visible y funcional en `presencial` e `hibrido`, y ausencia de mapa en `remoto`.
  - [ ] 0 errores de consola y red (excepto `404` esperado en prueba de evento inexistente).
  - [ ] Reporte de las 3 *ilities* (Security, Usability, Portability) registrado en `progress.md`.
