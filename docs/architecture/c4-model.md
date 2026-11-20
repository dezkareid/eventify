# C4 Model — Eventify

Este documento modela la arquitectura de **Eventify** utilizando el enfoque **C4 Model** (Contexto, Contenedores, Componentes y Código). Es un artefacto vivo: cuando `project-planner` diseña una nueva iniciativa que añade actores, servicios o módulos, debe actualizar el nivel correspondiente aquí.

---

## Nivel 1: Diagrama de Contexto del Sistema (System Context)

Muestra cómo los usuarios externos y las 4 áreas internas de **Eventify** interactúan con la plataforma, así como las fronteras con sistemas externos del ecosistema de eventos presenciales y remotos en LATAM.

```mermaid
flowchart TB
    subgraph Personas["Usuarios Externos (LATAM)"]
        Asistente["Asistente de Eventos\n[Persona]\nDescubre y participa en eventos\npresenciales, remotos o hibridos"]
        Organizador["Organizador de Eventos\n[Persona]\nPublica y gestiona agenda,\naforo y modalidades"]
    end

    subgraph Areas["Areas Internas de Eventify"]
        Marketing["Marketing\n[Area]\nSEO, campanas y adquisicion"]
        Contabilidad["Contabilidad\n[Area]\nPrecios, boletos y reportes"]
        Ops["Ops\n[Area]\nVenues, aforo y soporte remoto"]
        Desarrollo["Desarrollo\n[Area]\nArquitectura, ilities y calidad"]
    end

    Eventify["Plataforma Eventify\n[Sistema de Software]\nConecta usuarios con eventos\npresenciales y remotos en LATAM"]

    subgraph Externos["Sistemas Externos (Integraciones Actuales / Futuras)"]
        Maps["OpenStreetMap (Embed Gratuito)\n[Sistema Externo]\nMapa abierto sin API key e indicaciones para venues"]
        Streaming["YouTube No-Cookie / Jitsi Meet (Embed Gratuito)\n[Sistema Externo]\nTransmision y salas virtuales abiertas sin API key"]
        Pagos["Pasarela de Pagos LATAM\n[Sistema Externo]\nCobros y facturacion multi-moneda"]
        Notif["Servicio de Notificaciones\n[Sistema Externo]\nCorreos y recordatorios"]
    end

    Asistente -- "Explora y se registra (HTTPS)" --> Eventify
    Organizador -- "Gestiona eventos (HTTPS)" --> Eventify
    Marketing -- "Analiza descubrimiento y campanas" --> Eventify
    Contabilidad -- "Consulta ingresos y tarifas" --> Eventify
    Ops -- "Monitorea aforo y modalidades" --> Eventify
    Desarrollo -- "Evoluciona y verifica via Harness" --> Eventify

    Eventify -. "Embebe ubicacion y rutas (HTTPS / iframe)" .-> Maps
    Eventify -. "Embebe sala y transmision (HTTPS / iframe sandboxed)" .-> Streaming
    Eventify -. "Procesa pagos (futuro)" .-> Pagos
    Eventify -. "Envia confirmaciones (futuro)" .-> Notif
```

---

## Nivel 2: Diagrama de Contenedores (Containers)

Detalla los bloques ejecutables y de almacenamiento dentro de la **Plataforma Eventify**, destacando cómo la aplicación SSR de Astro y los contratos de dominio permiten mantener **Portability**, **Security** y **Usability**.

```mermaid
flowchart TB
    Browser["Navegador Web (Desktop / Mobile)\n[Cliente]\nHTML5 semantico, CSS moderno y JS minimo"]

    subgraph Sistema["Plataforma Eventify (Node.js / Astro Standalone)"]
        WebApp["Aplicacion Web SSR\n[Contenedor: Astro + Tailwind CSS v4]\nRenderiza paginas accesibles y rapidas\n(Usability + SEO)"]
        ApiLayer["API HTTP Interna\n[Contenedor: Astro Server Endpoints]\nExpone /api/events con validacion\ny cabeceras seguras (Security)"]
        DomainCore["Nucleo de Dominio\n[Contenedor: TypeScript Strict]\nEntidades y puertos EventRepository,\nMapProvider y StreamingProvider (Portability)"]
        InMemDB[("In-Memory Database\n[Contenedor: Memoria del Proceso]\nDatos semilla LATAM y estado en ejecucion\nIntercambiable por SQL sin cambiar UI")]
    end

    Browser -- "Navega vistas (HTTPS / HTML)" --> WebApp
    Browser -- "Consume/envia datos (HTTPS / JSON)" --> ApiLayer
    WebApp -- "Consulta casos de uso y puertos" --> DomainCore
    ApiLayer -- "Valida y delega operaciones" --> DomainCore
    DomainCore -- "Lee / escribe via interfaz" --> InMemDB
```

---

## Nivel 3: Diagrama de Componentes (Components — `apps/web`)

Desglosa los componentes internos actuales y planificados de la aplicación pública `@eventify/web` (`apps/web/`) dentro del monorepo.

```mermaid
flowchart LR
    subgraph Presentation["Presentacion (apps/web/src/pages, components, layouts, styles)"]
        BaseLayout["BaseLayout.astro\n[Componente Astro]\nLandmarks, skip-link, meta y nav"]
        HomePage["index.astro\n[Pagina Astro SSR]\nHero Eventify, catalogo y badges En vivo"]
        DetailPage["events/[id].astro\n[Pagina Astro SSR]\nDetalle de evento, SEO y 404"]
        LocationMap["EventLocationMap.astro\n[Componente Astro]\nMapa seguro OpenStreetMap (presencial/hibrido)"]
        VirtualRoom["EventVirtualRoom.astro\n[Componente Astro — Planificado]\nSala virtual, estados y fachada segura (remoto/hibrido)"]
        GlobalCSS["global.css\n[Estilos Tailwind v4]\nTokens visuales y estilos accesibles"]
    end

    subgraph Api["Frontera HTTP (apps/web/src/pages/api)"]
        EventsAPI["events.ts\n[Endpoint REST]\nGET /api/events?modality=...\nValidacion y headers seguros"]
    end

    subgraph Domain["Dominio (apps/web/src/domain)"]
        EventTypes["events/event.types.ts\n[Modelos TS]\nEventItem, EventGeoLocation, EventVirtualAccess"]
        EventRepo["events/event.repository.ts\n[Interfaz / Puerto]\nfindAll, findById, create"]
        MapProviderPort["maps/map-provider.ts\n[Interfaz / Puerto]\nresolveMapData, resolveFallbackSearchUrl"]
        StreamingProviderPort["streaming/streaming-provider.ts\n[Interfaz / Puerto — Planificado]\nresolveStreamData"]
    end

    subgraph Infrastructure["Infraestructura (apps/web/src/infrastructure)"]
        InMemoryRepo["db/in-memory-event.repository.ts\n[Adaptador]\nImplementacion en memoria + seed LATAM"]
        MapProviders["maps/openstreetmap.provider.ts\n[Adaptador]\nOpenStreetMap Embed gratuito sin API key"]
        StreamingProviders["streaming/open-streaming.provider.ts\n[Adaptador — Planificado]\nYouTube No-Cookie / Jitsi / Fallback HTTPS"]
    end

    HomePage --> BaseLayout
    DetailPage --> BaseLayout
    DetailPage --> LocationMap
    DetailPage --> VirtualRoom
    BaseLayout --> GlobalCSS
    HomePage --> EventRepo
    DetailPage --> EventRepo
    LocationMap --> MapProviderPort
    VirtualRoom --> StreamingProviderPort
    EventsAPI --> EventRepo
    EventRepo -. "implementa" .-> InMemoryRepo
    MapProviderPort -. "implementa" .-> MapProviders
    StreamingProviderPort -. "implementa" .-> StreamingProviders
    InMemoryRepo --> EventTypes
    StreamingProviders --> EventTypes
    EventsAPI --> EventTypes
```

---

## Nivel 4: Código (Referencia Viva)

En lugar de duplicar diagramas de clases que quedan obsoletos rápidamente, el nivel 4 se referencia directamente al código fuente tipado en TypeScript estricto dentro del monorepo:
- **Contratos de Dominio:** `apps/web/src/domain/events/event.types.ts`, `apps/web/src/domain/events/event.repository.ts`, `apps/web/src/domain/maps/map-provider.ts` y *(planificado)* `apps/web/src/domain/streaming/streaming-provider.ts`
- **Implementación In-Memory y Adaptadores:** `apps/web/src/infrastructure/db/in-memory-event.repository.ts`, `apps/web/src/infrastructure/maps/openstreetmap.provider.ts` y *(planificado)* `apps/web/src/infrastructure/streaming/open-streaming.provider.ts`
- **Presentación y Frontera HTTP:** `apps/web/src/pages/index.astro`, `apps/web/src/pages/events/[id].astro`, `apps/web/src/components/EventLocationMap.astro`, *(planificado)* `apps/web/src/components/EventVirtualRoom.astro` y `apps/web/src/pages/api/events.ts`
