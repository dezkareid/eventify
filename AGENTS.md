# Eventify — Gobernanza de Negocio y Estrategia Digital

Este documento define las reglas obligatorias que todo agente y desarrollador debe respetar en el repositorio de **Eventify**. Su propósito es garantizar que **cada línea de código esté alineada con la estrategia del negocio y nuestros atributos de calidad (*ilities*)**, evitando trabajo no justificado.

---

## 1. Identidad Estratégica de Eventify

- **Empresa:** Eventify
- **Misión:** Conectar usuarios con eventos y brindar experiencias únicas tanto presencial como remota.
- **Visión:** Convertirnos en la plataforma de eventos número 1 de LATAM.
- **Áreas de la empresa:**
  - **Marketing:** Adquisición, descubrimiento de eventos, SEO, campañas, conversión y posicionamiento en LATAM.
  - **Contabilidad:** Facturación, control de ingresos/boletos, reportes financieros, cumplimiento fiscal multi-país en LATAM.
  - **Ops (Operaciones):** Gestión de venues presenciales, transmisiones remotas, control de aforo, check-in, soporte a organizadores y asistentes.
  - **Desarrollo:** Arquitectura frontend/backend, experiencia de desarrollo (DX), calidad, automatización y sostenibilidad técnica.

---

## 2. Atributos de Calidad No Negociables (*Ilities*)

Toda decisión de producto o arquitectura debe proteger y fortalecer estas tres *ilities*:

1. **Security (Seguridad):**
   - Validar y sanitizar toda entrada de usuario en fronteras de API y formularios.
   - Prevenir XSS, inyección de contenido y exposición innecesaria de datos en respuestas HTTP o DOM.
   - Aplicar cabeceras HTTP seguras y principio de mínimo privilegio.
2. **Usability (Usabilidad):**
   - HTML semántico y accesibilidad WCAG 2.1 AA (navegación por teclado, foco visible, contraste adecuado, roles ARIA solo cuando el HTML nativo no baste).
   - Excelente rendimiento percibido y Core Web Vitals (LCP, INP, CLS).
   - Experiencia clara para eventos **presenciales**, **remotos** e **híbridos** (zonas horarias LATAM, ubicación o enlace de acceso visible, diseño responsive).
3. **Portability (Portabilidad):**
   - Priorizar estándares web nativos (HTML/CSS/Web APIs) sobre librerías propietarias o lock-in de frameworks.
   - Desacoplar la lógica de dominio del almacenamiento mediante interfaces de repositorio (`src/domain/*/repository.ts`), permitiendo migrar de la **In-Memory Database** a una base de datos persistente sin reescribir la UI ni los casos de uso.
   - Mantener configuración limpia y portable sin acoplamientos innecesarios a un proveedor cloud específico.

---

## 3. Gate Obligatorio de Alineamiento de Negocio

> **Regla crítica: No construir trabajo sin justificación.**

Antes de aceptar, planificar o implementar cualquier feature, refactor o dependencia nueva, el agente **DEBE** evaluar estos 4 criterios:

1. **Alineamiento Misión/Visión:** ¿Contribuye de forma clara a conectar usuarios con eventos (presenciales/remotos) o a posicionarnos como la plataforma #1 de LATAM?
2. **Patrocinio de Área:** ¿Qué área(s) de Eventify (**Marketing**, **Contabilidad**, **Ops** o **Desarrollo**) se beneficia(n) y cuál es el valor esperado?
3. **Impacto en *Ilities*:** ¿Mejora o preserva **Security**, **Usability** y **Portability**? (Si degrada alguna, debe rechazarse o replantearse).
4. **Coherencia con el Stack:** ¿Respeta nuestro stack (**Astro**, **Tailwind CSS**, **TypeScript**, **In-Memory Database**, **`pnpm`**)? Cualquier cambio de stack requiere justificación explícita previa.

### ¿Qué hacer si una solicitud NO pasa el Gate?
Si una solicitud no tiene justificación de negocio clara (ej. features vanidosas sin impacto en usuarios/áreas, sobre-ingeniería, librerías redundantes o cambios fuera de alcance):
1. **Detenerse** antes de escribir código o crear tareas.
2. **Explicar concretamente** qué criterio del Gate falla (Misión/Visión, Área beneficiaria, *Ilities* o Stack).
3. **Proponer una alternativa alineada** o pedir al usuario la justificación de negocio antes de continuar.

---

## 4. Stack Tecnológico y Convenciones

- **Estructura:** Monorepo con **`pnpm workspaces`** (`apps/*` para aplicaciones como `apps/web`, `packages/*` para paquetes compartidos).
- **Gestor de paquetes:** `pnpm` (obligatorio; no usar `npm` ni `yarn`).
- **Framework Web:** Astro (SSR con `@astrojs/node` para soportar operaciones reales sobre la base de datos en memoria).
- **Estilos:** Tailwind CSS v4 + CSS moderno estándar.
- **Lenguaje:** TypeScript en modo estricto (`strict`).
- **Persistencia (demo):** In-Memory Database detrás de contratos en `apps/<app>/src/domain/` (o `packages/` si se comparte entre proyectos).
- **Arquitectura viva:** Consultar y mantener actualizados:
  - `docs/architecture/overview.md`
  - `docs/architecture/c4-model.md`

---

## 5. Flujo Oficial del Harness de Desarrollo

En Eventify operamos en **dos niveles**, ambos gobernados por el Gate de Negocio y las 3 *ilities*:

### Nivel Proyecto (Iniciativas multi-área o estructurales)
1. **Planificación (`project-planner`):** Valida el Gate de Negocio, analiza esfuerzo, tiempo e impacto por área (Marketing, Contabilidad, Ops, Desarrollo), genera `plan.md`, `tasks.md` y `progress.md` en `docs/projects/<slug>/` y actualiza `overview.md` y el **C4 Model** (`c4-model.md`).
2. **Implementación (skill `eventify-feature-dev` — Modo A):** Lee los documentos del proyecto, consulta **`modern-web-guidance`** antes de escribir HTML/CSS/JS cliente, implementa incrementalmente y actualiza `tasks.md` y `progress.md`.
3. **Verificación (`chrome-verifier`):** Valida los cambios en navegador real mediante **Chrome DevTools MCP**, auditando criterios de aceptación y las 3 *ilities*, y registra el reporte final en `progress.md`.

### Nivel Feature de un Proyecto (Cambios acotados o historias puntuales)
1. **Validación + Implementación (skill `eventify-feature-dev` — Modo B):** Valida el Gate de Negocio, vincula la feature al proyecto en `docs/projects/<slug>/` (si pertenece a uno), consulta **`modern-web-guidance`**, implementa respetando las capas y *ilities*, y actualiza `tasks.md`/`progress.md` si corresponde.
2. **Verificación (`chrome-verifier`):** Audita la feature en navegador real con **Chrome DevTools MCP** validando comportamiento, accesibilidad, consola/red y las 3 *ilities*.
