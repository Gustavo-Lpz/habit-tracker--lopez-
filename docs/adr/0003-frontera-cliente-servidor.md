# ADR-0003: Frontera cliente/servidor — Client Components con Server Actions para mutaciones

**Fecha:** 2026-05-23
**Estado:** Aceptado

## Contexto

Next.js 15 App Router permite mezclar Server Components (sin JS en el browser) y Client Components (`"use client"`). La spec establece explícitamente que todas las pantallas usan Client Components con Supabase browser client, con SWR para `/history` y `useState` para la pantalla de check-in. La decisión que quedaba abierta era cómo estructurar las mutaciones en ese contexto: pasarlas por Server Actions o escribir directamente desde el browser client.

## Decisión

Client Components en todas las pantallas con `createBrowserClient()` para fetching. Server Actions con `createServerClient()` para todas las mutaciones.

**Fetching:**
- Todas las pantallas: Client Components con Supabase browser client
- `/history`: SWR para fetching y revalidación
- `/checkin/[date]`: `useState` para estado local del formulario

**Mutaciones de datos:**
- Todas las escrituras de dominio (habits, check-ins, badges) pasan por Server Actions en `actions/`
- Server Actions usan `createServerClient()` — punto único de validación pre-escritura

**Mutaciones de Auth:**
- Login, registro y logout usan `createBrowserClient()` directamente desde los Client Components de `(auth)/`
- Estos métodos son del SDK de Supabase Auth (`signInWithPassword`, `signUp`, `signOut`) y no pasan por `actions/`

**Clientes de Supabase:**
```
createBrowserClient() → Client Components (reads)
createServerClient() → Server Actions (writes) y middleware.ts (auth)
```

**Patrón de mutación:**
```
Client Component → Server Action (validación + createServerClient()) → Supabase → re-fetch vía SWR o router.refresh()
```

## Alternativas consideradas

### Server-first (Server Components por defecto)

Todo Server Component salvo donde hay interactividad explícita. Fetching en el servidor via `createServerClient()`.

**Trade-off real:** contradice la decisión explícita de la spec (Ronda 3 — "todas las pantallas usan Client Components con Supabase browser client") y requeriría cambiar SWR por `revalidatePath()` en el historial. Las ventajas de bundle mínimo y fetching en servidor son reales, pero el costo de contradecir una decisión ya tomada en el proceso de diseño supera esas ventajas en este proyecto.

**Por qué se descartó:** la spec cierra explícitamente el patrón de rendering. Reabrir esa decisión implicaría revisar también los criterios de aceptación que asumen estado de cliente (CA de sesión expirada con modal, manejo de errores inline, etc.).

### Mutaciones directas desde el browser client

Eliminar los Server Actions y escribir directamente via `supabase.from(...).insert(...)` en el componente.

**Trade-off real:** simplifica el stack a un único cliente, pero distribuye la lógica de validación pre-escritura en cada componente. En un flujo donde agentes generan formularios nuevos, no hay un contrato explícito de dónde debe vivir la validación — cada formulario generado decide por su cuenta. Con Server Actions en `actions/`, hay una convención forzada: si quieres escribir, vas a `actions/` y ahí validas.

**Por qué se descartó:** la centralización de la validación en `actions/` reduce el riesgo de formularios generados que escriben sin validar, a cambio de mantener dos clientes con responsabilidades diferentes — trade-off aceptable.

## Consecuencias

**Positivas:**
- Patrón de fetching consistente: todos los componentes usan el mismo browser client para leer datos.
- Las mutaciones tienen un punto de validación centralizado en `actions/` antes de escribir en BD.
- RLS funciona en ambos clientes: el browser client envía el JWT de sesión automáticamente; el server client lo obtiene del token refrescado por el middleware.

**Negativas / trade-offs aceptados:**
- Dos clientes de Supabase con responsabilidades distintas (reads en browser client, writes en server client) — el implementer debe conocer la distinción y no cruzar responsabilidades.
- Sin actualización optimista: después de una mutación, la UI espera el re-fetch de SWR o el `router.refresh()` antes de mostrar el resultado — latencia perceptible en acciones del usuario.
