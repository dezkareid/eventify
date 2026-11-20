# Tareas del Proyecto: [Nombre del Proyecto]

Leyenda de estado: `[ ]` Pendiente · `[/]` En progreso · `[x]` Completada

## Resumen de Esfuerzo

| Fase | Tareas | Esfuerzo Estimado |
| :--- | :--- | :--- |
| Fase 1: Dominio y Datos | T-01 | X h |
| Fase 2: UI y Modern Web | T-02 | X h |
| Fase 3: Verificación | T-03 | X h |

---

## Backlog Detallado

### [ ] T-01: [Título de la tarea]
- **Área:** Desarrollo / Ops / Marketing / Contabilidad
- **Esfuerzo:** S (1-2 h)
- **Dependencias:** Ninguna
- **Criterios de Aceptación:**
  - [ ] Criterio verificable 1
  - [ ] Criterio verificable 2

### [ ] T-02: [Título de la tarea]
- **Área:** Desarrollo
- **Esfuerzo:** M (2-4 h)
- **Dependencias:** T-01
- **Criterios de Aceptación:**
  - [ ] Se consultó `modern-web-guidance` antes de implementar UI/CSS/JS
  - [ ] Cumple accesibilidad (HTML semántico, teclado, responsive)
  - [ ] `pnpm astro check` y `pnpm build` pasan sin errores

### [ ] T-03: Verificación integral con Chrome DevTools
- **Área:** Desarrollo / Ops
- **Esfuerzo:** S (1 h)
- **Dependencias:** T-02
- **Criterios de Aceptación:**
  - [ ] Auditado por `chrome-verifier` en `http://localhost:4321`
  - [ ] 0 errores de consola y red
  - [ ] Reporte registrado en `progress.md`
