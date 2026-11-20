---
name: eventify-feature-dev
description: >-
  Flujo oficial para desarrollar en Eventify en dos modos: (1) a nivel proyecto a partir
  de docs/projects/<slug>/ (plan.md, tasks.md, progress.md) o (2) a nivel feature puntual
  dentro de un proyecto existente. Aplica siempre el Gate de Negocio, modern-web-guidance,
  las 3 ilities (Security, Usability, Portability) y handoff a chrome-verifier.
---

# Desarrollo de Proyectos y Features en Eventify

Usa este skill siempre que vayas a iniciar o continuar código en **Eventify**, ya sea ejecutando un **proyecto planificado** o desarrollando una **feature puntual dentro de un proyecto**.

---

## Paso 1: Identificar el Modo de Trabajo y Cargar Contexto

Lee primero `AGENTS.md`, `docs/architecture/overview.md` y `docs/architecture/c4-model.md`. Luego determina en qué modo estás operando:

### Modo A: Nivel Proyecto (`docs/projects/<slug>/`)
Aplica cuando trabajas sobre una iniciativa planificada por `project-planner` (múltiples tareas, varias áreas o cambios estructurales).
1. Localiza la carpeta del proyecto en `docs/projects/<slug>/`.
2. Lee obligatoriamente `plan.md`, `tasks.md` y `progress.md`.
3. Selecciona la siguiente tarea pendiente en `tasks.md` respetando dependencias y márcala como `[/]`.

### Modo B: Nivel Feature de un Proyecto
Aplica cuando desarrollas una **feature específica** dentro de un proyecto existente (por ejemplo, una tarea/historia puntual de `tasks.md` o una mejora acotada que no requiere re-planificar todo el proyecto).
1. **Validar el Gate de Negocio (`AGENTS.md`):** Confirma que la feature aporta a la Misión/Visión, identifica el área beneficiaria (Marketing, Contabilidad, Ops o Desarrollo) y verifica que no degrade Security, Usability ni Portability. Si no está justificada, detente y repórtalo.
2. **Vincular al proyecto (si existe):**
   - Si la feature pertenece a un proyecto en `docs/projects/<slug>/`, lee su `plan.md`, `tasks.md` y `progress.md` y trabaja sobre esa tarea específica.
   - Si es una feature incremental sobre la app base sin carpeta de proyecto, define brevemente antes de codear: alcance, criterios de aceptación y si impacta algún contenedor/componente del **C4 Model** (`docs/architecture/c4-model.md`). Si introduce un cambio arquitectónico mayor o involucra múltiples áreas, sugiere ejecutar primero `project-planner`.

---

## Paso 2: Consultar Modern Web Guidelines (OBLIGATORIO en ambos modos)
Antes de escribir cualquier HTML, CSS, componente Astro o JavaScript del lado cliente:
1. Activa y sigue el skill **`modern-web-guidance`**.
2. Ejecuta búsquedas específicas para los patrones de UI, layout, formularios, rendimiento o interacción que vayas a construir:
   ```sh
   npx -y modern-web-guidance@latest search "<caso de uso>"
   ```
3. Aplica los estándares web nativos recomendados (ej. `<dialog>`, Popover API, `:has()`, container queries, `:user-valid`, `content-visibility`, fetch priority, View Transitions) evitando librerías innecesarias o patrones obsoletos.

---

## Paso 3: Revisar Checklist de *Ilities*
Consulta [checklist-ilities.md](./references/checklist-ilities.md) para validar los requisitos concretos de:
- **Security** (validación, sanitización, cabeceras seguras).
- **Usability** (WCAG 2.1 AA, semántica, estados interactivos, Core Web Vitals).
- **Portability** (acceso a datos siempre mediante interfaces en `src/domain/`, cero acoplamiento directo a la implementación en memoria desde páginas Astro).

---

## Paso 4: Implementación Incremental
Implementa el cambio dentro del proyecto/workspace correspondiente (`apps/<proyecto>/` o `packages/<paquete>/`, por ejemplo `apps/web/`) respetando la arquitectura en capas de Eventify:
- Dominio e interfaces en `apps/<app>/src/domain/` (o `packages/` si se comparte)
- Implementaciones de almacenamiento en `apps/<app>/src/infrastructure/`
- Endpoints HTTP en `apps/<app>/src/pages/api/`
- Vistas y componentes en `apps/<app>/src/pages/`, `src/layouts/`, `src/components/`
- Usa siempre `pnpm` (y `pnpm --filter @eventify/<app>` cuando operes sobre un proyecto específico).

---

## Paso 5: Validación Técnica Local
Antes de dar por terminada la tarea o feature, ejecuta:
```sh
pnpm check
pnpm build
```
Corrige cualquier error de tipos, sintaxis o build antes de continuar.

---

## Paso 6: Actualizar Documentación y Handoff a Verificación
- **En Modo A (Nivel Proyecto) o feature vinculada a un proyecto:**
  1. Marca la(s) tarea(s) completadas como `[x]` en `docs/projects/<slug>/tasks.md`.
  2. Actualiza `docs/projects/<slug>/progress.md` (estado actual, fecha, registro de tareas/archivos modificados, patrones de `modern-web-guidance` aplicados y rutas listas para verificación).
- **En Modo B (Feature incremental independiente):**
  1. Entrega un resumen estructurado con: archivos modificados, patrones de `modern-web-guidance` aplicados, impacto en *ilities* y rutas/flujos a verificar.
  2. Si la feature agregó nuevos endpoints o componentes relevantes, actualiza o señala la actualización necesaria en `docs/architecture/c4-model.md`.
- **En ambos modos:** Indica explícitamente que el siguiente paso es invocar al agente **`chrome-verifier`** para auditar los cambios en navegador real con Chrome DevTools MCP.
