---
name: nueva-prueba-manual
description: cuando se quiere agregar una prueba manual al plan de pruebas del proyecto
tools:
  - Glob
  - Read
  - Edit
  - Write
---

Este es un procedimiento de registro, no un agente de razonamiento. No ejecutas pruebas ni juzgas si una prueba pasó. Solo garantizas formato, unicidad del criterio referenciado y verificabilidad antes de escribir el bloque.

## Paso 1 — Determinar el ID correlativo

1. Usa `Glob` con el patrón `docs/pruebas-manuales.md` para comprobar si el archivo existe.
2. Si existe, léelo completo con `Read` y extrae el número mayor de todos los encabezados con formato `### TC-NNN`.
3. El ID de la nueva prueba es ese máximo + 1, con zero-padding a 3 dígitos (p. ej. `TC-004`).
4. Si el archivo no existe o no contiene ningún `TC-NNN`, el ID es `TC-001`.

## Paso 2 — Recopilar campos obligatorios

Si algún campo falta en la solicitud, preguntarlo al usuario antes de continuar. No inventar valores.

| Campo | Regla de aceptación |
|-------|---------------------|
| **Nombre** | Frase corta que identifica la prueba. No puede ser igual al nombre de otro TC existente. |
| **Criterio** | Referencia exacta a **un solo** criterio de `spec.md`: sección y nombre del criterio (p. ej. `Check-ins › Solo un check-in por usuario por fecha`). Si el usuario indica más de uno, detener y emitir el mensaje de rechazo del Paso 3. |
| **Precondición** | Estado del sistema y datos necesarios antes de ejecutar la prueba, con el mismo nivel de detalle que los pasos. Validar en Paso 3. |
| **Pasos** | Lista numerada de acciones. Validar en Paso 3. |
| **Resultado esperado** | Lo que se observa en la UI o en la DB al finalizar los pasos. Validar en Paso 3. |
| **Estado** | Uno de: `pendiente`, `pasada`, `fallida`. Si no se indica, asumir `pendiente` y notificarlo. |

## Paso 3 — Validar criterio, pasos y resultado esperado

Ejecutar las tres validaciones antes de continuar. Si alguna falla, detener y devolver el mensaje de rechazo correspondiente. No escribir el archivo si hay un rechazo.

### Validación de unicidad de criterio

La prueba debe referenciar **exactamente un** criterio de `spec.md`.

Si el usuario indica más de uno, devolver exactamente:

```
RECHAZADO — Criterio múltiple.
Motivo: esta prueba referencia más de un criterio: [listar los criterios indicados].
Corrección: separar en tantas pruebas como criterios haya e invocar el skill una vez por cada una.
```

### Validación de pasos

Un paso es **válido** si:
- Describe una acción discreta y única (un clic, un ingreso de dato, una navegación a una URL concreta).
- Cuando requiere datos de entrada, los incluye de forma literal (email, contraseña, nombre, número — nunca "un valor cualquiera" ni "datos de prueba").
- Nombra el elemento de la UI con el que se interactúa (etiqueta del botón, nombre del campo, ruta de la página).

Un paso es **inválido** si:
- Es vago o agrupa varias acciones: "el usuario navega un poco", "completar el formulario", "configurar el entorno".
- Omite el dato de entrada cuando la acción lo requiere: "ingresar un email" sin especificar cuál.
- La destino de la navegación no es concreto: "ir a la sección de check-ins" sin URL ni ruta.

Si hay al menos un paso inválido, devolver exactamente:

```
RECHAZADO — Paso ambiguo.
Motivo: [citar el paso o los pasos que fallan y explicar el defecto concreto de cada uno].
Corrección: reescribir cada paso con una acción discreta, elemento de UI nombrado y dato literal cuando corresponda.
```

### Validación de resultado esperado

El resultado esperado es **válido** si:
- Describe algo observable directamente en la UI (texto visible, elemento presente o ausente, URL del navegador) o en la DB (valor de un campo en una fila concreta).
- Puede confirmarse respondiendo sí o no sin interpretación subjetiva.

El resultado esperado es **inválido** si:
- Es vago o subjetivo: "la app funciona bien", "el resultado es correcto", "el usuario puede continuar", "todo se guarda".
- Describe intención o estado interno en lugar de lo observable: "el sistema procesa la solicitud", "los datos se validan".
- No especifica qué elemento concreto de la UI o la DB debe revisarse.

Si el resultado esperado es inválido, devolver exactamente:

```
RECHAZADO — Resultado esperado no observable.
Motivo: [citar el resultado y explicar por qué no es verificable con sí/no].
Corrección: describir qué texto, elemento o valor concreto de la UI o la DB debe aparecer o cambiar.
```

## Paso 4 — Escribir la prueba

Solo llegar aquí si el Paso 3 no produjo rechazos. Usar exactamente esta plantilla:

```markdown
### TC-NNN — <nombre de la prueba>

**Criterio:** <sección › nombre del criterio en spec.md>
**Precondición:** <estado del sistema y datos antes de empezar>
**Pasos:**
1. <acción discreta con elemento de UI nombrado y dato literal si aplica>
2. …
**Resultado esperado:** <lo que se ve o se lee en la UI o la DB; verificable con sí/no>
**Estado:** pendiente
```

- Si `docs/pruebas-manuales.md` ya existe, agregar el bloque al final del archivo con `Edit`, precedido de una línea en blanco.
- Si el archivo no existe, crearlo con `Write` e incluir el encabezado `# Plan de pruebas manuales` antes del primer bloque.

## Lo que este procedimiento nunca hace

- No ejecuta la prueba ni navega la aplicación.
- No decide si una prueba pasó, falló o es válida funcionalmente.
- No modifica el estado de una prueba existente. Si el usuario pide actualizar el estado de un TC, responder: `"Este procedimiento solo agrega pruebas nuevas. Para cambiar el estado de un TC existente, edítalo directamente en docs/pruebas-manuales.md."`
- No propone casos de prueba adicionales ni edge cases fuera del criterio indicado.
- No evalúa si el criterio de la spec está bien redactado.
- No produce ningún bloque hasta que todos los campos estén presentes y las validaciones del Paso 3 pasen.
