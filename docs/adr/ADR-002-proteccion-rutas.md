# ADR-002: Proteger rutas autenticadas con middleware de Next.js

**Estado:** Aceptado  
**Fecha:** 2026-05-22  
**Decidido por:** Gustavo López

## Contexto

Las rutas protegidas deben redirigir a `/login` sin mostrar contenido. El modelo base del proyecto usa Client Components con browser client, que detectan sesión de forma asíncrona y pueden producir flash de contenido antes del redirect.

## Decisión

`middleware.ts` en la raíz del proyecto usando `@supabase/ssr` con `createMiddlewareClient`. Intercepta cada request antes de que llegue al componente, lee la cookie de sesión y redirige a `/login` si no hay sesión válida.

## Consecuencias

- Cero flash de contenido protegido — la redirección ocurre antes de que el navegador reciba HTML.
- La lógica de protección vive en un único archivo (`middleware.ts`), no duplicada por página.
- El middleware corre en Edge Runtime de Vercel: sin APIs de Node.js, sin filesystem.
- Requiere configurar `@supabase/ssr` correctamente para que el middleware refresque el token de sesión en cada request — paso crítico para que las cookies de sesión no expiren silenciosamente.
- El `matcher` del middleware debe cubrir explícitamente todas las rutas protegidas.
