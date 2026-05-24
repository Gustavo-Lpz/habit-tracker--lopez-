# BUILD-READY.md — Fitness Habit Tracker

Marca cada casilla. Si todas están en ✅, el build arranca sin dudas.
Si alguna está en ❌, ese ítem debe cerrarse primero.

> Los ítems con ⚠️ al final tienen una nota de verificación — léela antes de marcar.

---

## 1. Spec — sin huecos bloqueadores

- [ ] `spec.md` existe y contiene: objetivo, scope (qué entra / qué no), CAs numerados y no-goals.
- [ ] Todos los CAs están en formato "Dado / Cuando / Entonces" sin ambigüedad de sujeto ni de condición.
- [ ] Las reglas de negocio clave están cerradas: unicidad `(user_id, habit_id, date)`, soft delete, inmutabilidad de check-ins, lógica de racha, actualización de `best_streak`.
- [ ] Los no-goals están explicitados: mobile nativo, gamificación avanzada, notificaciones, integración con wearables, perfiles públicos, exportación de imagen.
- [ ] No hay CA que referencie un campo, tabla o ruta que no exista en los ADRs o en `plan.md`. ⚠️ *CA-29 a CA-31 ("share progress") están en spec pero el plan los excluye explícitamente — decisión intencional, no un olvido.*

---

## 2. ADRs — tres cerrados y consistentes con spec

- [ ] ADR-0001 tiene estado "Aceptado" y define exactamente 5 tablas: `habits`, `check_ins`, `session_exercises`, `profiles`, `badges`.
- [ ] El esquema de ADR-0001 coincide con `CLAUDE.md`: `UNIQUE(user_id, habit_id, date)` en `check_ins`, `deleted_at` en `habits`, `best_streak` en `profiles`, `UNIQUE(user_id, badge_type)` en `badges`.
- [ ] ADR-0002 tiene estado "Aceptado" y cubre todos los CAs de autenticación (CA-1 a CA-6) con middleware central + `@supabase/ssr`.
- [ ] ADR-0003 tiene estado "Aceptado" y define: `createBrowserClient` para reads en Client Components, Server Actions con `createServerClient` para todas las mutaciones de dominio, auth directa en `(auth)/` sin Server Actions.
- [ ] No hay contradicción entre los tres ADRs: middleware Edge Runtime (ADR-0002) y Server Actions (ADR-0003) usan clientes Supabase distintos sin conflicto.

---

## 3. Diseño — coherente con ADRs y sin componentes sin respaldo

- [ ] `docs/diseño.md` define paleta de colores, tipografía, escala de espaciado e inventario de componentes primitivos y compuestos.
- [ ] Los roles de color no se contradicen con spec ni con ADRs: `violet-600` para CTAs, `emerald-500` para training, `amber-400` para rest, `red-600` para errores.
- [ ] Todos los componentes mencionados en `plan.md` aparecen en el inventario de `docs/diseño.md` (`Button`, `Input`, `Textarea`, `Spinner`, `EmptyState`, `Card`, `ErrorMessage`, `NavBar`, `HabitCard`, `CheckInForm`, `ExerciseRow`, `CheckInReadOnly`, `StreakCounter`, `BadgeCard`, `CelebrationOverlay`, `HistoryItem`, `ShareButton`, `SessionExpiredModal`).
- [ ] La fila `/dashboard` en `docs/diseño.md` muestra `StreakCounter`, `HabitCard`, `EmptyState` y `BadgeCard`, pero `plan.md` solo implementa un stub (T07b). ⚠️ *Confirmar si la pantalla de dashboard completa entra en scope o si T07b es suficiente para todos los CAs (ningún CA exige contenido en /dashboard más allá de que la ruta exista).*
- [ ] Los criterios de aceptación de diseño al final de `docs/diseño.md` no contradicen ningún CA de `spec.md`.

---

## 4. Pruebas — cada CA mapeado a un TC

- [ ] `docs/pruebas-manuales.md` existe y tiene exactamente 31 casos de prueba (TC-001 a TC-031), uno por CA de `spec.md`.
- [ ] Cada TC tiene precondición explícita, pasos numerados y resultado esperado verificable por un humano sin acceso al código.
- [ ] TC-001 a TC-007 cubren todos los CAs de autenticación y navegación.
- [ ] TC-008 a TC-011 cubren todos los CAs de CRUD de hábitos.
- [ ] TC-012 a TC-018 cubren todos los CAs de check-in (incluyendo retroactivo, inmutabilidad y error de red).
- [ ] TC-019 a TC-020 cubren historial con hábito eliminado y pesos máximos con distinción mayúsculas/minúsculas.
- [ ] TC-021 a TC-025 cubren todos los CAs de racha (sin registros, consecutivos, corte por rest, corte por día vacío, best_streak).
- [ ] TC-026 a TC-028 cubren badges (desbloqueo, animación, sin duplicado).
- [ ] TC-029 a TC-031 cubren share progress. ⚠️ *Estos TCs están documentados pero el plan no incluye tareas para implementarlos. Confirmar que esta desalineación es aceptada antes del build.*
- [ ] La ruta del archivo de pruebas en `.claude/agents/implementer.md` dice `docs/plan-de-pruebas.md`, pero el archivo real es `docs/pruebas-manuales.md`. ⚠️ *Corregir el path en `implementer.md` antes de arrancar T01 — de lo contrario el agente reportará "archivo no encontrado" en cada tarea.*

---

## 5. Plan — criterio de "hecho" por tarea

- [ ] `plan.md` tiene 15 tareas atómicas en orden de dependencias declaradas: T01 → T02 → T03a/b → T04a/b → T05 → T06 → T07 → T07b → T08 → T09 → T10a/b → T11 → T12a/b → T13 → T14a/b → T15.
- [ ] Cada tarea tiene un bloque "Hecho cuando" con criterio observable (en browser, en `npm run build`, o en Supabase dashboard).
- [ ] Las dependencias de cada tarea son consistentes con el orden: ninguna tarea se ejecutable antes que sus dependencias.
- [ ] TC-024 ("día sin check-in corta la racha") está cubierto en la lógica de T14a (`calculateStreak`) pero no se menciona explícitamente en el "Hecho cuando" de ninguna tarea. ⚠️ *Confirmar si el unit test de T14a (array vacío entre días) cubre implícitamente TC-024, o agregar TC-024 al "Hecho cuando" de T14b.*
- [ ] El plan excluye explícitamente "share progress" con la nota al inicio — esa exclusión es consciente y aceptada por el equipo.

---

## 6. Infraestructura — env, setup, agentes, skills y git

### Archivos de configuración

- [ ] `.env.example` está presente con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` sin valores reales, y sin `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] `SETUP.md` está presente con prerrequisitos de sistema, creación de proyectos Supabase DEV y PROD, y checklist de arranque.
- [ ] `CONTEXT.md` existe en la raíz (puede estar vacío — indica que no hubo ediciones manuales previas al build).

### Agentes

- [ ] Los 5 agentes existen en `.claude/agents/`: `arquitecto.md`, `diseñador.md`, `implementer.md`, `qa.md`, `reviewer.md`.
- [ ] Smoke test de `implementer` pasado: confirmó que lee contexto, lista archivos que tocaría y espera aprobación antes de escribir código.
- [ ] Smoke tests de `arquitecto`, `diseñador`, `qa` y `reviewer` pasados.

### Skills

- [ ] Las 2 skills existen: `.claude/skills/nueva-prueba-manual/SKILL.md` y `.claude/skills/nuevo-adr/SKILL.md`.
- [ ] Smoke tests de ambas skills pasados.

### Gitflow

- [ ] El repositorio tiene las ramas `main` y `develop` (local y remoto).
- [ ] Todos los archivos del setup previo al build están commiteados en `develop`: ADRs, `docs/diseño.md`, `docs/pruebas-manuales.md`, `plan.md`, `SETUP.md`, agentes (`.claude/agents/`), skills (`.claude/skills/`), y los cambios en `CLAUDE.md`. ⚠️ *Actualmente estos archivos están sin commitear — `git status` muestra 14 archivos sin trackear y `CLAUDE.md` modificado.*
- [ ] `develop` está mergeado en `main` o `main` está al día con `develop` (sin divergencias).
- [ ] El build arranca desde la rama `develop`, no desde `main`. ⚠️ *El repo está actualmente en `main`. Cambiar a `develop` antes de ejecutar T01.*
- [ ] `git status` en la rama de trabajo muestra "nothing to commit, working tree clean" antes de crear la primera rama de feature.
