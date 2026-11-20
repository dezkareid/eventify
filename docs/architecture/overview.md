# Arquitectura de Eventify — Vista General

Este documento es la referencia viva de la arquitectura frontend y de dominio de **Eventify**. Debe mantenerse actualizado por el agente `project-planner` cada vez que un proyecto introduzca nuevos flujos, componentes o integraciones.

Para el desglose formal por niveles (Contexto, Contenedores y Componentes), consulta el [C4 Model de Eventify](./c4-model.md).

---

## 1. Estrategia de Negocio y Áreas

- **Misión:** Conectar usuarios con eventos y brindar experiencias únicas tanto presencial como remota.
- **Visión:** Convertirnos en la plataforma de eventos número 1 de LATAM.

| Área | Enfoque Principal en Eventify | Ejemplos de Iniciativas Alineadas |
| :--- | :--- | :--- |
| **Marketing** | Descubrimiento, SEO, conversión y alcance en LATAM | Landing de eventos, filtros por ciudad/modalidad, metadatos Open Graph, campañas |
| **Contabilidad** | Ingresos, precios, monedas LATAM, control de boletos | Resumen de precios/monedas, reportes de ventas, conciliación de registros |
| **Ops** | Logística presencial/remota, aforo, check-in, soporte | Control de cupos, enlaces de streaming, información de venue, estados del evento |
| **Desarrollo** | Arquitectura, *ilities*, DX, automatización y calidad | Harness de agentes, estándares web modernos, pruebas en navegador, portabilidad de datos |

---

## 2. Arquitectura en Capas (Orientada a *Portability*)

La interfaz web y los endpoints de Astro nunca acceden directamente a la implementación concreta de almacenamiento ni a SDKs propietarios de terceros. Toda interacción pasa por contratos en `src/domain/` (`EventRepository`, `MapProvider`), permitiendo reemplazar la **In-Memory Database** por PostgreSQL/LibSQL o intercambiar el proveedor de mapas (por defecto **OpenStreetMap** gratuito y sin API key) sin tocar las vistas.

```mermaid
flowchart TB
    subgraph UI["Capa de Presentacion (Astro + Tailwind CSS)"]
        Pages["Paginas SSR (src/pages/*.astro, events/[id].astro)"]
        Components["Componentes UI (src/components/EventLocationMap.astro)"]
        Layouts["Layouts Semanticos (src/layouts/)"]
        API["Server Endpoints (src/pages/api/*)"]
    end

    subgraph Domain["Capa de Dominio (Contratos Portables)"]
        Types["Entidades y Tipos (event.types.ts)"]
        RepoPort["Puerto: EventRepository (event.repository.ts)"]
        MapPort["Puerto: MapProvider (map-provider.ts)"]
    end

    subgraph Infra["Capa de Infraestructura (Intercambiable)"]
        InMem["InMemoryEventRepository (in-memory-event.repository.ts)"]
        MapAdapters["OpenStreetMapEmbedProvider (openstreetmap.provider.ts)"]
    end

    Pages --> Layouts
    Pages --> Components
    Pages --> RepoPort
    Components --> MapPort
    API --> RepoPort
    RepoPort -. "implementado por" .-> InMem
    MapPort -. "implementado por" .-> MapAdapters
    InMem --> Types
```

---

## 3. Matriz de *Ilities* (Atributos de Calidad)

| Atributo (*Ility*) | Objetivo en Eventify | Decisiones Arquitectónicas | Cómo se Verifica |
| :--- | :--- | :--- | :--- |
| **Security** | Proteger usuarios, organizadores y datos de eventos | Validación estricta en APIs, sanitización de entradas, cabeceras seguras (`X-Content-Type-Options: nosniff`), cero `set:html` no confiable | Revisión de código + auditoría con `chrome-verifier` |
| **Usability** | Experiencias fluidas, accesibles y claras (presencial y remoto) | HTML5 semántico, WCAG 2.1 AA, Tailwind CSS responsive, estándares vía `modern-web-guidance`, optimización de CWV | Snapshot a11y, flujos reales y capturas con `chrome-verifier` |
| **Portability** | Evitar lock-in tecnológico y facilitar escalado en LATAM | Interfaces de repositorio (`EventRepository`), estándares web nativos, Astro + `@astrojs/node`, `pnpm` | Inspección de dependencias y separación `domain/` vs `infrastructure/` |
