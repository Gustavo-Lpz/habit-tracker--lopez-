# Pruebas manuales — Fitness Habit Tracker

Generado por el agente `qa`. Cubre los 31 criterios de aceptación de `spec.md`.  
Ejecutar con la app corriendo en `http://localhost:3000` contra una base de datos de test limpia.

**Datos de prueba base**

| Alias | Email | Contraseña |
|---|---|---|
| Usuario A | `tester-a@example.com` | `Test1234!` |
| Usuario B | `tester-b@example.com` | `Test1234!` |

---

## Autenticación

### TC-001 — Registro de usuario nuevo

**Precondición:** No existe ninguna cuenta con `tester-a@example.com` en Supabase.  
**Pasos:**
1. Navegar a `/signup`.
2. Ingresar email `tester-a@example.com`, contraseña `Test1234!`.
3. Hacer clic en el botón de registrar.

**Resultado esperado:** La URL cambia a `/dashboard`. No aparece mensaje de error.

---

### TC-002 — Credenciales inválidas muestran el error de Supabase

**Precondición:** Existe la cuenta `tester-a@example.com` (creada en TC-001).  
**Pasos:**
1. Navegar a `/login`.
2. Ingresar email `tester-a@example.com`, contraseña `Incorrecta999`.
3. Hacer clic en el botón de login.

**Resultado esperado:** La URL permanece en `/login`. La UI muestra el mensaje de error devuelto por Supabase Auth (ej. "Invalid login credentials").

---

### TC-003 — Login correcto redirige a /dashboard

**Precondición:** Existe la cuenta `tester-a@example.com`. No hay sesión activa.  
**Pasos:**
1. Navegar a `/login`.
2. Ingresar email `tester-a@example.com`, contraseña `Test1234!`.
3. Hacer clic en el botón de login.

**Resultado esperado:** La URL cambia a `/dashboard`. No aparece mensaje de error.

---

### TC-004 — Logout termina la sesión y redirige a /login

**Precondición:** El usuario A está autenticado y se encuentra en `/dashboard`.  
**Pasos:**
1. Hacer clic en el botón de logout disponible en la UI.

**Resultado esperado:** La URL cambia a `/login`. El contenido de `/dashboard` no es visible.

---

### TC-005 — Acceso sin sesión a ruta protegida redirige a /login

**Precondición:** No hay sesión activa en el navegador (abrir en modo incógnito o eliminar cookies).  
**Pasos:**
1. Escribir `http://localhost:3000/dashboard` en la barra del navegador y presionar Enter.

**Resultado esperado:** La URL cambia a `/login`. No se renderiza contenido de `/dashboard`.

---

### TC-006 — Sesión expirada muestra modal sin redirigir automáticamente

**Precondición:** El usuario A está autenticado y tiene `/dashboard` abierto.  
**Pasos:**
1. Abrir DevTools (F12) > **Application** > **Cookies** > `http://localhost:3000`.
2. Eliminar todas las cookies cuyo nombre empiece con `sb-`.
3. Sin cambiar de URL, hacer clic en cualquier botón interactivo de la página que dispare una llamada a Supabase (ej. botón de crear hábito).

**Resultado esperado:** Aparece un modal con el texto exacto "Tu sesión expiró, inicia sesión de nuevo". La URL **no** cambia automáticamente a `/login`.

---

## Navegación y rutas

### TC-007 — Redirección desde / según estado de sesión

**Precondición A:** El usuario A tiene sesión activa.  
**Pasos A:**
1. Navegar a `http://localhost:3000/`.

**Resultado esperado A:** La URL cambia a `/dashboard`.

**Precondición B:** No hay sesión activa en el navegador.  
**Pasos B:**
1. Navegar a `http://localhost:3000/`.

**Resultado esperado B:** La URL cambia a `/login`.

---

## CRUD de hábitos

### TC-008 — Crear hábito nuevo

**Precondición:** El usuario A está autenticado y se encuentra en `/habits`.  
**Pasos:**
1. Hacer clic en "Nuevo hábito" (o equivalente).
2. Ingresar nombre: `Fuerza`.
3. Ingresar descripción: `Entrenamiento de fuerza diario`.
4. Seleccionar frecuencia: `diaria`.
5. Guardar el hábito.

**Resultado esperado:** El hábito `Fuerza` aparece en la lista de hábitos activos en `/habits`.

---

### TC-009 — Editar hábito existente

**Precondición:** Existe el hábito `Fuerza` (TC-008). El usuario A está en `/habits`.  
**Pasos:**
1. Hacer clic en "Editar" sobre el hábito `Fuerza`.
2. Cambiar nombre a `Fuerza y movilidad`.
3. Cambiar descripción a `Fuerza, movilidad y flexibilidad`.
4. Guardar los cambios.

**Resultado esperado:** La lista muestra `Fuerza y movilidad` con descripción `Fuerza, movilidad y flexibilidad`. El nombre `Fuerza` ya no aparece.

---

### TC-010 — Eliminar hábito aplica soft delete y conserva historial

**Precondición:** Existe el hábito `Fuerza y movilidad` con un check-in registrado: fecha `2026-05-10`, grupo muscular `Piernas`, ejercicio `Sentadilla`, peso `80`.  
**Pasos:**
1. Ir a `/habits` > hacer clic en "Eliminar" sobre `Fuerza y movilidad` y confirmar.
2. Observar la lista de hábitos activos.
3. Ir a `/history`.
4. Ir a `/checkin/2026-05-24` y verificar si `Fuerza y movilidad` aparece como opción.

**Resultado esperado:**
- `Fuerza y movilidad` desaparece de la lista activa.
- En `/history` la sesión del `2026-05-10` sigue visible: hábito `Fuerza y movilidad`, grupo `Piernas`, ejercicio `Sentadilla`, peso `80`.
- En `/checkin/2026-05-24` el hábito `Fuerza y movilidad` no aparece como opción para nuevos check-ins.

---

### TC-011 — Estado vacío en lista de hábitos no produce error

**Precondición:** El usuario B está autenticado y no tiene ningún hábito creado.  
**Pasos:**
1. Navegar a `/habits`.

**Resultado esperado:** La página muestra un estado vacío (texto o elemento visual indicando que no hay hábitos). No aparece ningún error en pantalla ni en la consola del navegador.

---

## Check-in diario y retroactivo

### TC-012 — Check-in ofrece las opciones entrenamiento y descanso

**Precondición:** El usuario A está autenticado. Existe el hábito `Cardio` (frecuencia diaria). No hay check-in para `Cardio` en `2026-05-23`.  
**Pasos:**
1. Navegar a `/checkin/2026-05-23`.
2. Seleccionar el hábito `Cardio`.
3. Observar las opciones del formulario sin enviarlo.

**Resultado esperado:** El formulario muestra dos opciones diferenciadas: `entrenamiento` y `descanso`. Se puede seleccionar cualquiera sin que el formulario se envíe automáticamente.

---

### TC-013 — Check-in de entrenamiento registra grupo muscular, ejercicio y peso

**Precondición:** El usuario A está autenticado. Existe el hábito `Cardio`. No hay check-in para `Cardio` en `2026-05-22`.  
**Pasos:**
1. Navegar a `/checkin/2026-05-22`.
2. Seleccionar hábito `Cardio`, tipo `entrenamiento`.
3. Ingresar grupo muscular: `Piernas`, ejercicio: `Sentadilla`, peso: `80`.
4. Guardar el check-in.
5. Navegar nuevamente a `/checkin/2026-05-22`.

**Resultado esperado:** Los datos `Piernas`, `Sentadilla`, `80` son visibles en modo solo lectura.

---

### TC-014 — Check-in de descanso se guarda sin requerir ejercicios

**Precondición:** El usuario A está autenticado. Existe el hábito `Cardio`. No hay check-in para `Cardio` en `2026-05-21`.  
**Pasos:**
1. Navegar a `/checkin/2026-05-21`.
2. Seleccionar hábito `Cardio`, tipo `descanso`.
3. Guardar el check-in.
4. Navegar nuevamente a `/checkin/2026-05-21`.

**Resultado esperado:** El check-in se guarda sin pedir datos de ejercicios. Al volver, el registro muestra tipo `descanso` en modo solo lectura. No hay campos de ejercicio ni grupo muscular.

---

### TC-015 — Check-in retroactivo se guarda con la fecha seleccionada por el cliente

**Precondición:** El usuario A está autenticado. Existe el hábito `Cardio`. No hay check-in para `Cardio` en `2026-01-15`.  
**Pasos:**
1. Navegar a `/checkin/2026-01-15`.
2. Seleccionar hábito `Cardio`, tipo `entrenamiento`.
3. Ingresar grupo muscular: `Espalda`, ejercicio: `Remo con barra`, peso: `60`.
4. Guardar el check-in.
5. Ir a `/history`.

**Resultado esperado:** En `/history` aparece una sesión con fecha `2026-01-15`, hábito `Cardio`, grupo `Espalda`, ejercicio `Remo con barra`. La fecha registrada es `2026-01-15`, no la fecha actual.

---

### TC-016 — Check-in existente se muestra en modo solo lectura sin botones de edición

**Precondición:** Existe un check-in de tipo `entrenamiento` para `Cardio` en `2026-05-22` con datos `Piernas`, `Sentadilla`, `80` (TC-013).  
**Pasos:**
1. Navegar a `/checkin/2026-05-22`.

**Resultado esperado:** Los datos `Piernas`, `Sentadilla`, `80` son visibles. No hay botones de editar ni eliminar. Los campos no responden a clicks ni escritura.

---

### TC-017 — El sistema rechaza un segundo check-in para la misma fecha y hábito

**Precondición:** Existe un check-in de tipo `entrenamiento` para `Cardio` en `2026-05-22` (TC-013).  
**Pasos:**
1. Navegar a `/checkin/2026-05-22`.
2. Intentar iniciar un nuevo check-in para `Cardio` en esa fecha.

**Resultado esperado:** La UI muestra el check-in existente directamente. No aparece un formulario vacío de creación para esa fecha y hábito.

---

### TC-018 — Error de red al guardar muestra mensaje inline y mantiene el formulario abierto

**Precondición:** El usuario A está autenticado. Existe el hábito `Cardio`. No hay check-in para `Cardio` en `2026-05-18`.  
**Pasos:**
1. Abrir DevTools > pestaña **Network**.
2. Navegar a `/checkin/2026-05-18`.
3. Completar el formulario: hábito `Cardio`, tipo `entrenamiento`, grupo muscular `Pecho`, ejercicio `Press banca`, peso `60`.
4. Activar modo **Offline** en DevTools (desplegable "No throttling" → "Offline").
5. Hacer clic en el botón de guardar.

**Resultado esperado:** Aparece un mensaje de error dentro del formulario (no un `alert` del navegador). El formulario permanece abierto con los datos ingresados. La URL no cambia.

---

## Historial y pesos máximos

### TC-019 — Historial muestra sesiones de hábitos eliminados con el nombre original

**Precondición:** El hábito `Fuerza y movilidad` fue eliminado (TC-010). Tenía un check-in: fecha `2026-05-10`, grupo `Piernas`, ejercicio `Sentadilla`, peso `80`.  
**Pasos:**
1. Navegar a `/history`.

**Resultado esperado:** Aparece la sesión del `2026-05-10` con nombre de hábito `Fuerza y movilidad`, grupo `Piernas`, ejercicio `Sentadilla`, peso `80`.

---

### TC-020 — Peso máximo por ejercicio respeta mayúsculas/minúsculas

**Precondición:** El usuario A tiene los siguientes check-ins registrados para el hábito `Cardio`:
- `2026-05-01`: ejercicio `Press banca`, peso `70`.
- `2026-05-02`: ejercicio `Press banca`, peso `85`.
- `2026-05-03`: ejercicio `press banca` (minúscula inicial), peso `100`.  
**Pasos:**
1. Navegar a la sección de pesos máximos (en `/progress` o donde la UI los exponga).

**Resultado esperado:** Aparecen dos entradas separadas: `Press banca: 85` y `press banca: 100`. No aparece una única entrada combinada.

---

## Vista de progreso y racha

### TC-021 — Hábito sin check-ins muestra racha 0 con mensaje diferenciado visualmente

**Precondición:** El usuario A está autenticado. Existe el hábito `Meditación` sin ningún check-in.  
**Pasos:**
1. Navegar a `/progress`.

**Resultado esperado:** La racha actual muestra `0`. Se muestra el texto "Sin registros aún". La presentación de este estado es visualmente distinta a la de una racha perdida (diferencia observable: color, ícono o texto).

---

### TC-022 — Racha actual cuenta los días consecutivos de entrenamiento más recientes

**Precondición:** El usuario A tiene los siguientes check-ins de tipo `training` para `Cardio`: `2026-05-20`, `2026-05-21`, `2026-05-22`, `2026-05-23`. No hay días vacíos ni `rest` entre esas fechas.  
**Pasos:**
1. Navegar a `/progress`.

**Resultado esperado:** La racha actual muestra `4`.

---

### TC-023 — Un día de descanso corta la racha

**Precondición:** El usuario A tiene los siguientes check-ins para `Cardio`:
- `2026-05-19`: `training`. `2026-05-20`: `rest`. `2026-05-21`: `training`. `2026-05-22`: `training`. `2026-05-23`: `training`.  
**Pasos:**
1. Navegar a `/progress`.

**Resultado esperado:** La racha actual muestra `3` (solo `2026-05-21`, `2026-05-22`, `2026-05-23`).

---

### TC-024 — Un día sin check-in corta la racha

**Precondición:** El usuario A tiene los siguientes check-ins para `Cardio`:
- `2026-05-20`: `training`. `2026-05-21`: sin check-in. `2026-05-22`: `training`. `2026-05-23`: `training`.  
**Pasos:**
1. Navegar a `/progress`.

**Resultado esperado:** La racha actual muestra `2` (solo `2026-05-22` y `2026-05-23`).

---

### TC-025 — best_streak se actualiza y ambos valores son visibles al superarse

**Precondición:** El usuario A tiene `best_streak` visible como `3` en `/progress`. La racha actual es `3` (días `2026-05-21`, `2026-05-22`, `2026-05-23`).  
**Pasos:**
1. Navegar a `/checkin/2026-05-24`.
2. Registrar check-in de tipo `training` para `Cardio` (grupo `Piernas`, ejercicio `Sentadilla`, peso `80`).
3. Navegar a `/progress`.

**Resultado esperado:** La racha actual muestra `4`. La mejor racha histórica muestra `4`. Ambos valores son visibles en pantalla.

---

## Badges e hitos

### TC-026 — Badge "Primera semana" se desbloquea al completar 7 días consecutivos de entrenamiento

**Precondición:** El usuario A tiene check-ins de tipo `training` para `Cardio` en `2026-05-01` a `2026-05-06` (6 días consecutivos). No tiene el badge `week_1`.  
**Pasos:**
1. Navegar a `/checkin/2026-05-07`.
2. Registrar check-in de tipo `training` para `Cardio` (grupo `Espalda`, ejercicio `Dominadas`, peso `0`).
3. Guardar.
4. Navegar a `/progress`.

**Resultado esperado:** Aparece una animación de celebración tras guardar. En `/progress` el badge "Primera semana" es visible exactamente una vez.

---

### TC-027 — Badge "30 días" se desbloquea al completar 30 días consecutivos de entrenamiento

**Precondición:** El usuario A tiene check-ins de tipo `training` para `Cardio` en `2026-04-01` a `2026-04-29` (29 días consecutivos). No tiene el badge `days_30`.  
**Pasos:**
1. Navegar a `/checkin/2026-04-30`.
2. Registrar check-in de tipo `training` para `Cardio` (grupo `Pecho`, ejercicio `Fondos`, peso `0`).
3. Guardar.
4. Navegar a `/progress`.

**Resultado esperado:** Aparece una animación de celebración. En `/progress` el badge "30 días" es visible exactamente una vez.

---

### TC-028 — Badge ya desbloqueado no genera nueva animación ni duplicado

**Precondición:** El usuario A ya tiene el badge `week_1`. Tiene 6 check-ins de tipo `training` para `Cardio` en `2026-05-15` a `2026-05-20` (racha previa de 7 días se cortó con un día de descanso antes del `2026-05-15`).  
**Pasos:**
1. Navegar a `/checkin/2026-05-21`.
2. Registrar check-in de tipo `training` para `Cardio` (grupo `Hombros`, ejercicio `Press militar`, peso `50`).
3. Guardar.
4. Navegar a `/progress`.

**Resultado esperado:** No aparece animación de celebración para el badge `week_1`. El badge "Primera semana" aparece exactamente una vez en el perfil.

---

## Compartir progreso

### TC-029 — El texto copiado al portapapeles tiene el formato exacto definido en spec

**Precondición:** El usuario A tiene los siguientes datos acumulados: total de días de entrenamiento `5`, pesos máximos `Press banca → 85`, `Sentadilla → 80`. El usuario está en `/progress`.  
**Pasos:**
1. Hacer clic en el botón de compartir progreso.
2. Si aparece un diálogo nativo (Web Share), cerrarlo sin compartir.
3. Abrir Bloc de notas y pegar con Ctrl+V.

**Resultado esperado:** El texto pegado es exactamente:
```
Entrené 5 días en total.
Pesos máximos:
- Press banca: 85 kg
- Sentadilla: 80 kg
```
Sin texto adicional ni saltos de línea extra al final.

---

### TC-030 — Diálogo nativo de compartir aparece en navegadores con Web Share API

**Precondición:** El usuario A está en `/progress` usando Chrome en Android (o cualquier navegador que soporte Web Share API).  
**Pasos:**
1. Hacer clic en el botón de compartir progreso.

**Resultado esperado:** Aparece el diálogo nativo de compartir del sistema operativo con el mismo contenido en texto plano definido en TC-029.

---

### TC-031 — Sin Web Share API solo se copia al portapapeles y no aparece error

**Precondición:** El usuario A está en `/progress` usando Firefox en escritorio (sin soporte de Web Share API).  
**Pasos:**
1. Hacer clic en el botón de compartir progreso.
2. Abrir Bloc de notas y pegar con Ctrl+V.

**Resultado esperado:** No aparece ningún diálogo nativo de compartir. No se muestra ningún mensaje de error relacionado con Web Share. El portapapeles contiene el texto en el formato exacto definido en TC-029.
