# ADR-0001: Modelo de datos — esquema relacional mínimo

**Fecha:** 2026-05-23
**Estado:** Aceptado

## Contexto

El proyecto requiere: CRUD de hábitos con soft delete, check-ins diarios por hábito con unicidad garantizada, registro de ejercicios con pesos por sesión, cálculo de peso máximo histórico por ejercicio, persistencia de racha histórica por usuario, y badges desbloqueables por hitos de racha. La decisión central era cómo modelar los ejercicios y pesos: en tablas relacionales separadas o en una columna JSONB dentro del check-in.

## Decisión

Cinco tablas relacionales:

```sql
habits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  name            text NOT NULL,
  description     text CHECK (length(description) <= 200),
  frequency_type  text NOT NULL CHECK (frequency_type IN ('daily', 'weekly')),
  frequency_count int,
  deleted_at      timestamptz,
  created_at      timestamptz DEFAULT now()
)

check_ins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  habit_id    uuid REFERENCES habits(id) NOT NULL,
  date        date NOT NULL,
  type        text NOT NULL CHECK (type IN ('training', 'rest')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, habit_id, date)
)

session_exercises (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id   uuid REFERENCES check_ins(id) ON DELETE CASCADE NOT NULL,
  exercise_name text NOT NULL,
  muscle_group  text NOT NULL,
  weight        numeric NOT NULL
)

profiles (
  user_id     uuid PRIMARY KEY REFERENCES auth.users,
  best_streak int NOT NULL DEFAULT 0
)

badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  badge_type  text NOT NULL CHECK (badge_type IN ('week_1', 'days_30')),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_type)
)
```

RLS habilitado en todas las tablas. `session_exercises` filtra via `check_in_id → check_ins.user_id`. `habits` con soft delete: `deleted_at IS NOT NULL` excluye hábitos activos; sus check-ins y pesos máximos permanecen visibles con el nombre original.

**Transaccionalidad:** la creación de un check-in de tipo `training` hace dos inserts secuenciales en el Server Action (insert en `check_ins`, luego inserts en `session_exercises`). No se usa RPC. Un fallo en el segundo insert deja un check-in sin ejercicios — aceptable dado que los check-ins son inmutables y el escenario de fallo parcial en Vercel + Supabase es de baja probabilidad.

## Alternativas consideradas

### Tabla plana con JSONB para ejercicios

Un único modelo con columna `exercises jsonb` dentro de `check_ins`.

**Trade-off real:** `MAX(weight)` sobre campos JSONB requiere `jsonb_array_elements` o procesamiento equivalente en capa de aplicación. Dado que el feature de pesos máximos es un requisito explícito del producto y se consulta frecuentemente desde `/progress`, esta complejidad recaería en cada query de lectura. Con tablas relacionales, la query es `SELECT MAX(weight) FROM session_exercises WHERE exercise_name = $1 AND user_id = $2` — directa y sin lógica de parseo.

**Por qué se descartó:** el costo de mantener lógica de extracción JSONB en cada consulta de pesos máximos supera el costo de mantener una tabla adicional con RLS indirecto.

### RPC de Postgres para transaccionalidad atómica

Usar una función Postgres que reciba el check-in y sus ejercicios y garantice atomicidad.

**Trade-off real:** atomicidad completa a cambio de dividir la lógica de escritura entre TypeScript y SQL. El escenario de fallo parcial (check-in guardado sin ejercicios) requiere que el insert de `session_exercises` falle de forma independiente al de `check_ins` dentro del mismo Server Action — escenario de baja probabilidad en Vercel + Supabase. Además, los check-ins son inmutables por spec, por lo que un estado huérfano tampoco es recuperable con RPC.

**Por qué se descartó:** la complejidad de mantener una función SQL versionada no justifica la ganancia dado el bajo riesgo de fallo parcial y la ausencia de recuperabilidad de todos modos.

## Consecuencias

**Positivas:**
- `SELECT MAX(weight) WHERE exercise_name = ?` es una query directa sin parsear JSON.
- Sin tabla de ejercicios maestros normalizada: agregar un ejercicio nuevo no requiere migración.
- Los check-ins son inmutables (cerrado en spec), lo que elimina el riesgo de inconsistencia en updates parciales de `session_exercises`.
- `UNIQUE(user_id, badge_type)` en `badges` previene duplicados a nivel de BD sin lógica adicional en la app.

**Negativas / trade-offs aceptados:**
- RLS en 5 tablas. La política de `session_exercises` es indirecta (no tiene `user_id` propio), lo que hace la política más difícil de inspeccionar.
- Creación de check-in de entrenamiento escribe en 2 tablas sin transacción explícita. Un fallo parcial deja estado irrecuperable dado que los check-ins son inmutables.
