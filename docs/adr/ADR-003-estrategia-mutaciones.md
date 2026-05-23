# ADR-003: Mutaciones mediante llamadas directas al browser client de Supabase

**Estado:** Aceptado  
**Fecha:** 2026-05-22  
**Decidido por:** Gustavo López

## Contexto

AGENTS.md prefiere Server Actions sobre API routes para mutaciones. Ronda 3 de la spec fijó Client Components con browser client como modelo base. Estas dos directivas tienen fricción: los Server Actions funcionan naturalmente con Server Components; invocarlos desde Client Components requiere wiring adicional.

## Decisión

Las mutaciones (crear/editar hábitos, guardar check-ins) se ejecutan con llamadas directas a `supabase.from(...).insert/update/delete(...)` desde los Client Components usando el browser client.

## Consecuencias

- Consistente con el modelo de rendering de Ronda 3 — no introduce una segunda forma de interactuar con la base de datos.
- El código de mutación vive junto al formulario que lo dispara, reduciendo la cantidad de archivos por feature.
- La clave anon de Supabase es pública por diseño (`NEXT_PUBLIC_`); la seguridad de datos recae en RLS, no en ocultar la clave.
- Si en el futuro se necesita lógica de servidor antes de escribir (validaciones complejas, side effects), no hay capa intermedia donde ponerla sin agregar una nueva abstracción.
- Esta decisión anula la preferencia de Server Actions de AGENTS.md para este proyecto específico.
