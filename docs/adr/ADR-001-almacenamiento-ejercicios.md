# ADR-001: Almacenar ejercicios en tabla separada con FK a check_ins

**Estado:** Aceptado  
**Fecha:** 2026-05-22  
**Decidido por:** Gustavo López

## Contexto

Un check-in de tipo `training` contiene al menos un grupo muscular con ejercicios y pesos (texto libre). Esta relación uno-a-muchos puede vivir en una tabla separada o embebida como JSONB en el check-in.

## Decisión

Tabla `exercises(id, check_in_id, muscle_group, name, weight_kg)` con FK a `check_ins`.

## Consecuencias

- Los pesos máximos se calculan con `SELECT MAX(weight_kg) GROUP BY name` — SQL estándar, sin funciones JSONB.
- RLS se aplica uniformemente sobre la tabla `exercises`.
- Guardar un check-in de entrenamiento requiere dos operaciones; se maneja con una transacción o insertando ejercicios solo después de confirmar el check-in.
- Agregar campos futuros (series, repeticiones) no requiere migración de esquema de columnas.
