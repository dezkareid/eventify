# Checklist de Ilities para Desarrollo en Eventify

Usa esta referencia durante la implementación de cualquier feature en **Astro + Tailwind CSS + In-Memory DB**.

## 1. Security (Seguridad)
- [ ] Todos los parámetros de query, body JSON y campos de formulario se validan explícitamente en el servidor (tipos, longitudes, valores permitidos).
- [ ] No se utiliza `set:html` con contenido proveniente de usuarios o fuentes no confiables.
- [ ] Los endpoints `/api/*` devuelven códigos HTTP apropiados (`400` para entrada inválida, `404` para recurso inexistente) sin filtrar stack traces ni detalles internos.
- [ ] Las respuestas JSON incluyen `Content-Type: application/json; charset=utf-8` y `X-Content-Type-Options: nosniff`.

## 2. Usability (Usabilidad)
- [ ] Estructura de landmarks HTML5 correcta (`<header>`, `<nav>`, `<main>`, `<footer>`) y un único `<h1>` por página.
- [ ] Todos los controles interactivos son accesibles por teclado (`<button>`, `<a>`, `<input>`, `<select>` nativos) con estado `:focus-visible` claro.
- [ ] Los formularios usan `<label for="...">` asociados, validación nativa HTML y estados claros de error/éxito.
- [ ] La modalidad del evento (**Presencial**, **Remoto** o **Híbrido**), fecha/zona horaria LATAM y ubicación/acceso son inmediatamente legibles en desktop y mobile.
- [ ] Imágenes y contenido optimizados pensando en Core Web Vitals (dimensiones explícitas para evitar CLS, carga prioritaria solo en LCP).

## 3. Portability (Portabilidad)
- [ ] Las páginas y endpoints dependen de interfaces en `src/domain/` (ej. `EventRepository`), nunca de estructuras internas de `InMemoryEventRepository`.
- [ ] Se prefieren estándares web nativos (HTML/CSS/Web APIs sugeridos por `modern-web-guidance`) sobre librerías JS de terceros.
- [ ] No se introducen variables o APIs exclusivas de un proveedor cloud en la lógica de negocio.
