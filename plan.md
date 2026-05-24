# plan.md — Fitness Habit Tracker

Tareas atómicas para el agente `implementer`. Orden: setup → modelo de datos → auth → CRUD núcleo.  
Ninguna tarea excede 1 hora. Cada tarea tiene un único criterio verificable.  
Sin extensión (share progress): ese bloque queda fuera de este plan.

---

## T01 — Inicializar proyecto Next.js

**Deps:** —  
**ADR:** —  
**Test:** —

Ejecutar `npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"` en el directorio del proyecto. Confirmar que `tsconfig.json` tiene `"strict": true`. Crear la estructura de carpetas de AGENTS.md: `app/(auth)/`, `app/(app)/`, `components/ui/`, `lib/supabase/`, `actions/`, `types/`, `supabase/migrations/`. Agregar `.env.local` a `.gitignore`. Crear `CONTEXT.md` vacío en la raíz.

**Hecho cuando:** `npm run dev` arranca en `localhost:3000` y `npm run build` completa sin errores de TypeScript.

---

## T02 — Clientes Supabase y variables de entorno

**Deps:** T01  
**ADR:** ADR-0003  
**Test:** —

Instalar `@supabase/supabase-js`, `@supabase/ssr` y `swr`. Crear `lib/supabase/browser.ts` que exporta `createBrowserClient()` usando `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Crear `lib/supabase/server.ts` que exporta `createServerClient()` usando cookies del contexto Next.js. Crear `.env.local` con las dos variables en placeholder (`your-supabase-url`, `your-anon-key`).

**Hecho cuando:** `npm run build` completa; `lib/supabase/browser.ts` y `lib/supabase/server.ts` exportan sus funciones sin errores de TypeScript strict.

---

## T03a — Migraciones SQL y políticas RLS

**Deps:** T01  
**ADR:** ADR-0001  
**Test:** —

**Prerequisito:** instalar Supabase CLI (`npm install -g supabase`), ejecutar `supabase init` y `supabase link --project-ref <ref-del-proyecto>`.

Crear en `supabase/migrations/`: `0001_habits.sql`, `0002_check_ins.sql` (incluye `UNIQUE(user_id, habit_id, date)`), `0003_session_exercises.sql`, `0004_profiles.sql`, `0005_badges.sql`. Crear `0006_rls_policies.sql`: habilitar RLS en las 5 tablas y definir políticas SELECT/INSERT/UPDATE filtrando por `auth.uid() = user_id`; para `session_exercises`, filtrar via `check_in_id IN (SELECT id FROM check_ins WHERE user_id = auth.uid())`. Aplicar con `supabase db push`.

**Hecho cuando:** Las 5 tablas aparecen en el dashboard de Supabase con RLS habilitado y `UNIQUE(user_id, habit_id, date)` existe en `check_ins`.

---

## T03b — Tipos TypeScript del esquema

**Deps:** T03a  
**ADR:** ADR-0001  
**Test:** —

Crear `types/database.ts` con interfaces `Habit`, `CheckIn`, `SessionExercise`, `Profile`, `Badge` que reflejen exactamente el esquema de T03a. Incluir variantes de inserción (`HabitInsert`, `CheckInInsert`, etc.) para uso en Server Actions.

**Hecho cuando:** `npm run build` completa; `types/database.ts` exporta las 5 interfaces y sus variantes de inserción sin `any`.

---

## T04a — UI primitivos de formulario

**Deps:** T01  
**ADR:** —  
**Test:** —

Crear en `components/ui/`: `Button.tsx` (variantes `primary` violet-600, `ghost`, `destructive` red-600; prop `loading` muestra `Spinner` y deshabilita el botón), `Input.tsx` (label + campo + slot de error), `ErrorMessage.tsx` (texto red-600, siempre bajo el campo que lo originó), `Spinner.tsx` (círculo animado con Tailwind).

Para verificar, crear temporalmente `app/ui-test/page.tsx` que renderice `<Button loading>Guardar</Button>`; confirmar en browser que muestra Spinner y el botón no responde a clicks; eliminar la página antes de commitear.

**Hecho cuando:** `Button` con `loading={true}` muestra Spinner y está deshabilitado en el browser; `npm run build` completa sin `any`.

---

## T04b — UI primitivos de layout

**Deps:** T01  
**ADR:** —  
**Test:** —

Crear en `components/ui/`: `Textarea.tsx` (label + área multi-línea; validación de longitud máxima en el evento `onChange` con `ErrorMessage` cuando supera el límite), `EmptyState.tsx` (mensaje + acción opcional), `Card.tsx` (fondo blanco, `shadow-sm`).

**Hecho cuando:** `npm run build` completa y los 3 archivos existen en `components/ui/` con tipos explícitos y sin `any`.

---

## T05 — Middleware de autenticación central

**Deps:** T02  
**ADR:** ADR-0002  
**Test:** TC-005, TC-007

Crear `middleware.ts` en la raíz que usa `createServerClient()` para refrescar el token de sesión en cada request. Lógica de redirección: si el path es `/` y hay sesión activa → `redirect('/dashboard')`; si el path es `/` sin sesión → `redirect('/login')`; para cualquier otra ruta protegida sin sesión → `redirect('/login')`. Excluir `/login` y `/signup` del matcher. Definir `matcher` que cubre `/`, `/dashboard`, `/habits`, `/checkin/:path*`, `/history`, `/progress`.

**Hecho cuando:** Navegar a `localhost:3000/dashboard` sin sesión redirige a `/login` (TC-005); navegar a `localhost:3000/` con sesión redirige a `/dashboard` y sin sesión redirige a `/login` (TC-007).

---

## T06 — Páginas de login y registro

**Deps:** T04a, T05  
**ADR:** ADR-0002, ADR-0003  
**Test:** TC-001, TC-002, TC-003

Crear `app/(auth)/layout.tsx` con columna centrada, sin NavBar y fondo `gray-50`. Crear `app/(auth)/login/page.tsx` como Client Component: formulario email + contraseña, llama a `createBrowserClient().auth.signInWithPassword()`, redirige a `/dashboard` con `router.push()` al éxito, muestra error de Supabase en `ErrorMessage` al fallo. Crear `app/(auth)/signup/page.tsx` con misma estructura usando `auth.signUp()`.

**Hecho cuando:** TC-001 pasa (usuario nuevo se registra y llega a `/dashboard`), TC-002 pasa (credenciales inválidas muestran error de Supabase bajo el formulario) y TC-003 pasa (login con credenciales válidas redirige a `/dashboard`).

---

## T07 — Layout protegido, NavBar y logout

**Deps:** T04a, T06  
**ADR:** ADR-0002  
**Test:** TC-004

Crear `components/NavBar.tsx` con links a `/dashboard`, `/habits`, `/history`, `/progress` y botón logout que llama a `createBrowserClient().auth.signOut()` y redirige a `/login`. Crear `app/(app)/layout.tsx` con NavBar fija superior, fondo `gray-50` y slot `{children}`.

**Hecho cuando:** TC-004 pasa (logout redirige a `/login` y el contenido de la ruta protegida deja de ser visible).

---

## T07b — Dashboard stub

**Deps:** T07  
**ADR:** —  
**Test:** —

Crear `app/(app)/dashboard/page.tsx` como Client Component con un `<h1>Dashboard</h1>` y un párrafo de placeholder. No requiere datos ni lógica: su único propósito es que la ruta exista para que TC-001, TC-003 y TC-007 no den 404.

**Hecho cuando:** Navegar a `localhost:3000/dashboard` con sesión activa retorna la página sin error 404 ni redirección.

---

## T08 — Modal de sesión expirada

**Deps:** T07  
**ADR:** ADR-0002  
**Test:** TC-006

Crear `components/SessionExpiredModal.tsx` con overlay oscuro, panel centrado, texto exacto `"Tu sesión expiró, inicia sesión de nuevo"` y botón que navega a `/login` con `router.push()`; el modal no redirige automáticamente.

Crear `lib/supabase/auth-error.ts` con helper `isAuthError(error: unknown): boolean` que detecta `AuthSessionMissingError` y el código de error `PGRST301`. Crear `components/SessionWatcher.tsx` como Client Component que expone un contexto React con `showExpiredModal: () => void`; montar `SessionWatcher` en `app/(app)/layout.tsx`. Los Client Components envuelven sus llamadas a Supabase en try-catch y llaman a `showExpiredModal()` cuando `isAuthError(error)` retorna `true`.

**Hecho cuando:** El componente `SessionExpiredModal` renderiza el texto exacto `"Tu sesión expiró, inicia sesión de nuevo"` y el botón existe sin redirigir automáticamente (verificable abriendo el modal directamente con `useState(true)`); TC-006 como test de integración secundario con DevTools.

---

## T09 — Server Actions de hábitos

**Deps:** T02, T03a  
**ADR:** ADR-0003  
**Test:** —

Crear `actions/habits.ts` con tres Server Actions que usan `createServerClient()`: `createHabit` (insert en `habits`), `updateHabit` (update por `id` filtrando `user_id`), `deleteHabit` (soft delete: `SET deleted_at = now()` filtrando por `id` y `user_id`). Cada acción obtiene `user_id` de `session.user.id`; nunca lo acepta como parámetro del cliente.

**Hecho cuando:** `deleteHabit` con el `id` de un hábito de otro usuario no elimina ninguna fila (verificable en Supabase Table Editor: `deleted_at` queda `null`).

---

## T10a — Lista de hábitos y HabitCard

**Deps:** T07, T09  
**ADR:** ADR-0003  
**Test:** TC-008, TC-011

Crear `app/(app)/habits/page.tsx` como Client Component que carga hábitos activos (`deleted_at IS NULL`) con `createBrowserClient()` y renderiza lista de `HabitCard` o `EmptyState`. Crear `components/HabitCard.tsx` con nombre, descripción, frecuencia, botón "Editar" (navega a `/habits/[id]/edit`) y botón "Eliminar" (llama a `deleteHabit` y `router.refresh()`).

**Hecho cuando:** TC-008 pasa (hábito creado aparece en la lista) y TC-011 pasa (lista sin hábitos muestra `EmptyState` sin error en consola).

---

## T10b — Formularios de hábito (nuevo y edición)

**Deps:** T04b, T10a  
**ADR:** ADR-0003  
**Test:** TC-009

Crear `app/(app)/habits/new/page.tsx` con formulario: `Input` para nombre, `Textarea` para descripción (máx. 200 chars validado en cliente), selector de frecuencia (`daily` | `weekly`) con `Input` numérico condicional para `frequency_count`; envía a `createHabit` y redirige a `/habits` al éxito. Crear `app/(app)/habits/[id]/edit/page.tsx` idéntico en estructura pero precarga los datos del hábito desde Supabase y envía a `updateHabit`.

**Hecho cuando:** TC-009 pasa (edición de nombre y descripción refleja los nuevos valores en la lista de `/habits`).

---

## T11 — Server Action createCheckIn

**Deps:** T02, T03a  
**ADR:** ADR-0001, ADR-0003  
**Test:** TC-013, TC-017

Crear `actions/checkins.ts` con Server Action `createCheckIn` que recibe `habitId`, `date` (string DATE del cliente), `type: 'training' | 'rest'` y, si es training, un array de `{ exercise_name, muscle_group, weight }`. Antes del insert, consultar `SELECT id FROM habits WHERE id = habitId AND user_id = uid AND deleted_at IS NULL`; retornar `{ error: 'Hábito no válido' }` si no existe fila. Validar que no exista check-in previo para `(user_id, habit_id, date)` antes de insertar. Insertar en `check_ins` y, si es training, insertar secuencialmente en `session_exercises`. Retornar `{ error: string } | { success: true }`.

**Hecho cuando:** `npm run build` completa; intentar insertar un check-in con un `habitId` de otro usuario retorna `{ error: 'Hábito no válido' }` sin tocar la BD.

---

## T12a — Página /checkin/[date] y CheckInReadOnly

**Deps:** T10a, T11  
**ADR:** ADR-0003  
**Test:** TC-016, TC-017

Crear `app/(app)/checkin/[date]/page.tsx` como Client Component: leer `params.date`, cargar hábitos activos del usuario. Renderizar selector de hábito; al seleccionar uno (evento `onChange`), consultar si ya existe check-in para `(habitId, date)`; si existe, montar `CheckInReadOnly` con los datos; si no, montar `CheckInForm` (placeholder hasta T12b). Crear `components/CheckInReadOnly.tsx` que muestra el check-in existente en modo solo lectura sin botones ni campos interactivos; tipo `training` en `emerald-500`, tipo `rest` en `amber-400`.

**Hecho cuando:** TC-016 pasa (navegar a una fecha con check-in existente muestra los datos en solo lectura sin botones de edición ni campos interactivos).

---

## T12b — CheckInForm y ExerciseRow

**Deps:** T12a  
**ADR:** ADR-0003  
**Test:** TC-012, TC-013, TC-014, TC-015, TC-018

Crear `components/CheckInForm.tsx` con selector training/rest, lista dinámica de `ExerciseRow` (mínimo 1 si training), botón guardar que llama a `createCheckIn` pasando `params.date` como la fecha (nunca `new Date()`); si `createCheckIn` retorna `{ error }`, mostrar `ErrorMessage` inline sin cerrar el formulario. Crear `components/ExerciseRow.tsx` con inputs para `exercise_name` (máx. 100 chars), `muscle_group` (máx. 100 chars) y `weight`; validación en `onChange`.

**Hecho cuando:** TC-012 pasa (el formulario muestra las opciones training y rest diferenciadas visualmente), TC-013 pasa (check-in training guarda ejercicio y se muestra en solo lectura al recargar), TC-014 pasa (guardar tipo rest no requiere datos de ejercicios y persiste correctamente), TC-015 pasa (fecha en Supabase dashboard coincide con `params.date`, no con `new Date()`) y TC-018 pasa (modo Offline en DevTools muestra `ErrorMessage` inline sin cerrar el formulario).

---

## T13 — Historial /history

**Deps:** T12b  
**ADR:** ADR-0001  
**Test:** TC-010, TC-019

Crear `lib/fetchers/history.ts` con función para SWR: `LEFT JOIN habits ON check_ins.habit_id = habits.id` (sin filtro de `deleted_at` para preservar el nombre original del hábito aunque esté eliminado) y `JOIN session_exercises`; filtrar solo check-ins de tipo `training`; ordenar por fecha descendente. Crear `app/(app)/history/page.tsx` con SWR usando el fetcher, `Spinner` mientras carga, `EmptyState` si no hay sesiones y componente `HistoryItem` (fecha, nombre del hábito, grupos musculares, ejercicios, pesos).

**Hecho cuando:** TC-019 pasa (sesión de hábito eliminado visible con su nombre original) y la parte de historial de TC-010 pasa (la sesión del hábito eliminado `Fuerza y movilidad` aparece en `/history` con su nombre original tras ejecutar el soft delete de T10a).

---

## T14a — Lógica de racha y Server Action best_streak

**Deps:** T02, T03b  
**ADR:** ADR-0001  
**Test:** —

Crear `lib/streak.ts` con `calculateStreak(checkIns: CheckIn[]): number`: la racha es global (todos los hábitos del usuario, sin filtrar por hábito); un día cuenta si tiene al menos un check-in de tipo `training` en cualquier hábito activo o eliminado; iterar hacia atrás desde el check-in más reciente; un día con solo `rest` o sin ningún check-in corta la racha; retornar 0 si no hay check-ins de tipo `training`. Crear `actions/progress.ts` con `updateBestStreak(currentStreak: number)` que hace upsert en `profiles` solo si la racha actual supera `best_streak`.

**Hecho cuando:** Ejecutar en consola `node -e "const {calculateStreak} = require('./lib/streak'); console.log(calculateStreak([...]))"` con arrays de prueba retorna: 4 para 4 días consecutivos training, 3 cuando el cuarto día más antiguo es rest, y 0 con array vacío.

---

## T14b — Vista /progress y StreakCounter

**Deps:** T14a, T13  
**ADR:** ADR-0001  
**Test:** TC-020, TC-021, TC-022, TC-023, TC-024, TC-025

Crear `lib/fetchers/maxWeights.ts`: `SELECT MAX(weight), exercise_name FROM session_exercises JOIN check_ins ON check_in_id = check_ins.id WHERE check_ins.user_id = uid GROUP BY exercise_name` (agrupación case-sensitive por defecto en Postgres). Crear `components/StreakCounter.tsx` que distingue visualmente con texto diferente "Sin registros aún" (racha 0 sin ningún check-in de tipo `training`) de racha perdida (racha 0 con historial previo). Crear `app/(app)/progress/page.tsx` con `StreakCounter`, pesos máximos (usando `lib/fetchers/maxWeights.ts`) y lista de badges del usuario; llamar a `updateBestStreak` al montar solo si la racha calculada supera el `best_streak` cargado.

**Hecho cuando:** TC-020 pasa (`"Press banca"` y `"press banca"` aparecen como dos entradas de peso máximo separadas en `/progress`), TC-021 pasa (texto "Sin registros aún" visualmente distinto al estado de racha perdida), TC-022 pasa (racha 4 con 4 días consecutivos training), TC-023 pasa (día rest corta la racha), TC-024 pasa (día sin check-in corta la racha — la racha solo cuenta los días consecutivos de training posteriores al día vacío) y TC-025 pasa (`best_streak` se actualiza y ambos valores son visibles en pantalla).

---

## T15 — Badges y animación de celebración

**Deps:** T11, T14b  
**ADR:** ADR-0001  
**Test:** TC-026, TC-027, TC-028

Crear `actions/badges.ts` con `unlockBadge(badgeType: 'week_1' | 'days_30'): Promise<{ isNew: boolean }>` que inserta en `badges` solo si el badge no existe para el usuario; la constraint `UNIQUE(user_id, badge_type)` previene duplicados a nivel DB. Agregar en `/progress` lógica que evalúa si la racha actual alcanza ≥ 7 (`week_1`) o ≥ 30 (`days_30`) y llama a `unlockBadge` al montar el componente **solo si el badge correspondiente no está ya en la lista de badges cargados**; si ya está en la lista, no hacer el round-trip al servidor. Crear `components/CelebrationOverlay.tsx` que se monta con `animate-bounce` y se desmonta automáticamente tras 2 s; activarlo solo cuando `unlockBadge` retorna `{ isNew: true }`. Mostrar lista de `BadgeCard` (nombre del badge + fecha de desbloqueo) en `/progress`.

**Hecho cuando:** TC-026 pasa (badge "Primera semana" aparece en `/progress` y la animación se muestra solo al desbloquearlo), TC-027 pasa (badge "30 días" se desbloquea con animación al completar el día 30 consecutivo) y TC-028 pasa (badge ya desbloqueado no genera nueva animación ni duplicado en `/progress`).
