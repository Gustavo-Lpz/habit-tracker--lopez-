# ADR-0002: Estrategia de autenticación — middleware central con @supabase/ssr

**Fecha:** 2026-05-23
**Estado:** Aceptado

## Contexto

La app requiere que todos los usuarios autenticados vean únicamente sus propios datos y que las rutas protegidas sean inaccesibles sin sesión activa. Hay dos lugares donde puede vivir la verificación de sesión: un middleware central de Next.js que intercepta cada request antes de que cualquier componente se ejecute, o verificación individual en cada componente o Server Action protegido.

## Decisión

Middleware central en `middleware.ts` usando `@supabase/ssr`.

```
middleware.ts         → refresca token de sesión, redirige a /login si no hay sesión
createServerClient()  → usado en Server Actions para mutaciones
createBrowserClient() → usado en todos los Client Components para fetching
```

El middleware se aplica a todas las rutas excepto `/login` y `/signup`.

## Alternativas consideradas

### Verificación por componente o Server Action

Cada componente protegido o Server Action verifica la sesión de forma individual llamando a `getUser()` o `getSession()` antes de ejecutar su lógica.

**Trade-off real:** en un flujo donde agentes de IA generan archivos nuevos frecuentemente, un componente generado sin la verificación de sesión expone datos sin producir error de build — el fallo es silencioso en tiempo de desarrollo y visible para el usuario en producción. Con middleware central, la protección de rutas es declarativa: si el componente se ejecuta, el usuario ya está autenticado. No hay forma de olvidarlo por omisión.

**Por qué se descartó:** el riesgo de un componente generado que accede a datos sin verificar sesión no es recuperable fácilmente en un flujo de desarrollo con agentes. El middleware elimina esa clase de error por diseño.

## Consecuencias

**Positivas:**
- Protección declarativa: imposible que un componente olvide la verificación porque nunca llega a ejecutarse si no hay sesión.
- El JWT de sesión se refresca automáticamente en cada request — el cliente de Supabase del servidor siempre tiene un token válido para que RLS funcione sin configuración adicional por componente.
- Patrón único y predecible para todo el equipo y los agentes.

**Negativas / trade-offs aceptados:**
- El middleware corre en Vercel Edge Runtime, que no tiene Node.js completo. Si en el futuro se necesita lógica de autorización compleja (roles, organizaciones), puede ser necesario migrar esa lógica a otro lugar.
- Requiere mantener la lista de rutas públicas en `middleware.ts` actualizada cuando se agreguen nuevas páginas no protegidas.
