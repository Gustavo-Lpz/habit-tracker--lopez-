# spec.md — Fitness Habit Tracker

## Objetivo

Aplicación web para que personas que entrenan regularmente registren sus sesiones de entrenamiento o descanso, consulten su historial, visualicen su racha de constancia y reciban reconocimiento visual por sus hitos de constancia.

---

## Scope

**Qué SÍ entra en este proyecto:**

- Registro y autenticación de usuarios con email y contraseña vía Supabase Auth
- CRUD de hábitos (nombre, descripción, frecuencia: diaria o N veces por semana)
- Check-in diario: el usuario indica si entrenó o descansó en un día dado
- Check-in retroactivo: el usuario puede registrar entrenamientos de cualquier fecha pasada sin límite
- Registro de detalle por sesión: grupo muscular trabajado, ejercicios realizados y peso utilizado (todos en texto libre)
- Consulta de check-ins existentes (inmutables: sin edición ni eliminación)
- Historial de entrenamientos del usuario autenticado, incluyendo sesiones de hábitos eliminados
- Registro de pesos máximos por ejercicio (coincidencia exacta de string)
- Vista de progreso con racha actual y mejor racha histórica
- Badges desbloqueables por hitos de racha (7 días, 30 días consecutivos de entrenamiento)
- Animaciones de celebración al desbloquear un badge o alcanzar un hito, y microinteracciones generales en la UI
- Compartir progreso mediante texto plano copiable al portapapeles y Web Share API (con fallback para navegadores sin soporte)

**Qué NO entra (no-goals):**

- Mobile nativo o PWA — la app prioriza escritorio; mobile debe ser funcional pero no pulido
- Gamificación avanzada: puntos, niveles, retos o sistemas de ranking
- Notificaciones push, recordatorios o emails automatizados
- Perfiles públicos, feeds, seguidores, modo compañero o cualquier forma de interacción entre cuentas
- Integración con wearables o apps externas (Apple Health, Google Fit, Strava, etc.)
- Análisis avanzado de rendimiento (volumen total, progresión por período, 1RM estimado, gráficas comparativas)
- Exportación de imagen o tarjeta de progreso
- Planes de entrenamiento generados automáticamente o sugerencias de rutinas
- Sistema de diseño elaborado, ilustraciones custom o cumplimiento WCAG más allá de contraste básico

---

## Criterios de aceptación

### Autenticación

1. Dado que el usuario no tiene cuenta, cuando completa el formulario de registro con email y contraseña y lo envía, entonces se crea su cuenta y queda autenticado en la aplicación.
2. Dado que el usuario ingresa credenciales inválidas, cuando envía el formulario de login o registro, entonces la UI muestra el mensaje de error que retorna Supabase Auth.
3. Dado que el usuario tiene cuenta, cuando ingresa email y contraseña correctos, entonces accede a su sesión autenticada y es redirigido a `/dashboard`.
4. Dado que el usuario está autenticado, cuando ejecuta la acción de logout, entonces su sesión termina y es redirigido a `/login`.
5. Dado que alguien intenta acceder a una ruta protegida sin sesión activa, cuando navega a esa URL, entonces es redirigido a `/login` sin ver contenido protegido.
6. Dado que la sesión del usuario expira mientras navega, cuando el sistema lo detecta, entonces muestra un modal "Tu sesión expiró, inicia sesión de nuevo" sin redirigir automáticamente.

### Navegación y rutas

7. Dado que el usuario accede a `/`, entonces es redirigido a `/dashboard` si tiene sesión activa, o a `/login` si no la tiene.

Rutas del proyecto:

| Ruta | Tipo | Protección |
|---|---|---|
| `/` | Redirección | — |
| `/login` | Client Component | Pública |
| `/signup` | Client Component | Pública |
| `/dashboard` | Client Component | Autenticada |
| `/habits` | Client Component | Autenticada |
| `/habits/new` | Client Component | Autenticada |
| `/habits/[id]/edit` | Client Component | Autenticada |
| `/checkin/[date]` | Client Component | Autenticada |
| `/history` | Client Component + SWR | Autenticada |
| `/progress` | Client Component | Autenticada |

### CRUD de hábitos

8. Dado que el usuario está autenticado, cuando crea un hábito con nombre, descripción (máx. 200 caracteres) y frecuencia (diaria o N veces por semana), entonces el hábito aparece en su lista de hábitos activos.
9. Dado que el usuario tiene hábitos creados, cuando edita el nombre, descripción o frecuencia de uno, entonces el hábito refleja los nuevos valores en la lista.
10. Dado que el usuario tiene hábitos creados, cuando elimina uno, entonces ese hábito desaparece de su lista activa (soft delete) y no es posible hacer nuevos check-ins sobre él, pero sus check-ins históricos siguen visibles en el historial y en pesos máximos con el nombre original.
11. Dado que el usuario no tiene hábitos creados, cuando accede a la lista de hábitos, entonces ve un estado vacío sin error.

### Check-in diario y retroactivo

12. Dado que el usuario tiene al menos un hábito activo, cuando realiza check-in para cualquier fecha (hoy o pasada), entonces puede indicar si ese día entrenó o descansó.
13. Dado que el usuario marca un día como entrenamiento, cuando completa el registro, entonces puede ingresar al menos un grupo muscular (texto libre, máx. 100 caracteres), los ejercicios realizados (texto libre, máx. 100 caracteres) y el peso utilizado en cada ejercicio.
14. Dado que el usuario marca un día como descanso, cuando guarda el check-in, entonces ese día queda registrado como descanso sin requerir datos de ejercicios.
15. Dado que el usuario selecciona una fecha pasada para registrar un check-in, cuando lo guarda, entonces el registro queda guardado con esa fecha (la fecha la provee el cliente; no hay límite de días hacia atrás).
16. Dado que el usuario ya realizó check-in en un día, cuando vuelve a esa fecha en `/checkin/[date]`, entonces puede consultar el registro existente pero no modificarlo ni eliminarlo — la UI muestra los campos en modo solo lectura sin botones de edición.
17. Dado que un día ya tiene check-in guardado, cuando el usuario intenta crear un nuevo check-in para esa misma fecha, entonces el sistema no lo permite y muestra el registro existente.
18. Dado que ocurre un fallo de red al guardar un check-in, entonces la UI muestra un mensaje de error inline en el formulario y el formulario no se cierra.

### Historial y pesos máximos

19. Dado que el usuario tiene check-ins de entrenamiento guardados, cuando accede a `/history`, entonces ve sus sesiones pasadas con la fecha, grupo muscular, ejercicios y pesos registrados, incluyendo sesiones de hábitos eliminados con el nombre original del hábito.
20. Dado que el usuario ha registrado el mismo ejercicio (mismo string exacto) en varias sesiones con distintos pesos, cuando consulta los pesos máximos, entonces el sistema muestra el mayor peso registrado para ese ejercicio. "Press banca" y "press banca" se tratan como ejercicios distintos.

### Vista de progreso y racha

21. Dado que el usuario accede a `/progress` con un hábito que no tiene check-ins, entonces la UI muestra racha 0 con mensaje "Sin registros aún" — diferenciado visualmente del estado de racha perdida.
22. Dado que el usuario tiene check-ins de entrenamiento en días consecutivos, cuando accede a `/progress`, entonces ve su racha actual como el número de días consecutivos más recientes con check-in de tipo `training`.
23. Dado que el usuario tiene un día marcado como descanso dentro de una secuencia de entrenamientos, cuando consulta la racha, entonces ese día de descanso corta la racha — la racha actual solo cuenta los días consecutivos de entrenamiento posteriores.
24. Dado que el usuario tiene un día sin ningún check-in dentro de una secuencia de entrenamientos, cuando consulta la racha, entonces ese día vacío corta la racha — la racha actual solo cuenta los días consecutivos de entrenamiento posteriores.
25. Dado que la racha actual del usuario supera su mejor racha histórica registrada, entonces el sistema actualiza el campo `best_streak` del usuario y muestra ambos valores en `/progress`.

### Badges e hitos

26. Dado que el usuario alcanza 7 días consecutivos de entrenamiento, cuando el sistema lo detecta, entonces desbloquea el badge "Primera semana", lo persiste en la base de datos, muestra una animación de celebración y el badge aparece en su perfil de progreso.
27. Dado que el usuario alcanza 30 días consecutivos de entrenamiento, cuando el sistema lo detecta, entonces desbloquea el badge "30 días", lo persiste, muestra una animación de celebración y el badge aparece en su perfil de progreso.
28. Dado que el usuario ya tiene un badge desbloqueado, cuando vuelve a alcanzar ese hito, entonces no se muestra nuevamente la animación de celebración ni se duplica el badge.

### Compartir progreso

29. Dado que el usuario está en `/progress`, cuando activa la opción de compartir, entonces el sistema genera un resumen en texto plano con el siguiente formato exacto y lo copia al portapapeles:

```
Entrené X días en total.
Pesos máximos:
- [ejercicio]: [peso] kg
- [ejercicio]: [peso] kg
```

30. Dado que el navegador del usuario soporta Web Share API, cuando activa la opción de compartir, entonces el sistema también ofrece compartir mediante las funciones nativas del dispositivo con el mismo contenido en texto plano.
31. Dado que el navegador del usuario no soporta Web Share API, cuando activa la opción de compartir, entonces solo se ejecuta la copia al portapapeles sin mostrar error relacionado con Web Share.

---

## Pruebas técnicas fuera de QA manual

Las siguientes verificaciones requieren acceso directo a Supabase y no son observables por UI:

- **Aislamiento de datos entre usuarios:** verificar que las políticas RLS en todas las tablas (`habits`, `check_ins`, `badges`) impiden que un usuario acceda a filas de otro usuario mediante queries directos.
- **Unicidad de check-ins:** verificar que la restricción `UNIQUE(user_id, habit_id, date)` existe en la tabla `check_ins` a nivel de base de datos.
- **Soft delete:** verificar que los registros con `deleted_at IS NOT NULL` en `habits` no son retornados por las queries de hábitos activos.
- **Persistencia de best_streak:** verificar que `best_streak` se actualiza correctamente cuando la racha actual lo supera y no retrocede cuando la racha se corta.

---

## No-goals

1. **Mobile nativo / PWA:** La app no se distribuye como app nativa ni implementa service workers. Mobile es funcional pero no optimizado.
2. **Gamificación avanzada:** No hay puntos, niveles, rankings, retos ni sistemas de progresión más allá de los badges de hito definidos.
3. **Notificaciones automatizadas:** No se envían alertas push, recordatorios ni emails de seguimiento.
4. **Interacción social:** No existe feed, perfiles públicos, seguidores, modo compañero, descubrimiento de usuarios ni ninguna forma de interacción entre cuentas. Todo el contenido compartido es iniciado manualmente por el usuario y no persiste en la plataforma.
5. **Integraciones externas:** No hay conexión con wearables, apps de salud ni servicios de terceros.
6. **Análisis avanzado:** No hay gráficas de volumen, comparativas entre períodos ni cálculos derivados como el 1RM estimado.
7. **Exportación de imagen:** No se genera tarjeta visual ni imagen de progreso.
8. **Diseño premium:** Sin sistema de diseño elaborado, ilustraciones custom ni cumplimiento WCAG más allá de contraste básico.

---

## Decisiones tomadas en entrevista

### Ronda 1 — Arquitectura de datos

- **Frecuencia semanal:** significa N veces por semana (`frequency_count INT`). No impone días fijos. No afecta el cálculo de racha.
- **Modelo de check-in:** una fila por día, unicidad por `(user_id, habit_id, date DATE)`, tipo `ENUM('training', 'rest')`.
- **Eliminación de hábito:** soft delete (`deleted_at TIMESTAMPTZ`). Check-ins se conservan y siguen visibles en historial y pesos máximos con el nombre original del hábito.
- **Ejercicios y grupos musculares:** texto libre. Pesos máximos calculados por coincidencia exacta de string. Sin catálogo ni normalización.
- **Racha:** actual calculada on-the-fly; mejor histórica persistida en columna `best_streak INT`, actualizada cuando la racha actual la supera.
- **Fechas:** `DATE` local enviada por el cliente, sin zona horaria. Check-ins retroactivos sin límite de días hacia atrás.

### Ronda 2 — QA y criterios verificables

- **Hábito sin check-ins:** muestra racha 0 con mensaje "Sin registros aún", diferenciado visualmente del estado de racha perdida.
- **Aislamiento entre usuarios:** movido a "Pruebas técnicas fuera de QA manual". No es criterio de aceptación de UI.
- **Validación de contraseña:** delegada a Supabase Auth. El CA verifica que el error se muestra, no la regla exacta.
- **Formato de compartir:** template fijo — "Entrené X días en total." seguido de lista de pesos máximos por ejercicio.
- **Hábitos eliminados:** sus check-ins aparecen en historial y en pesos máximos con el nombre original del hábito.

### Ronda 3 — Developer entrante

- **Rendering:** todas las pantallas usan Client Components con Supabase browser client. Historial con SWR. Pantalla del día con `useState`.
- **Rutas:** `/` redirige según sesión. Check-in retroactivo en `/checkin/[date]` como ruta propia.
- **Errores de red:** mensaje de error inline en el formulario; el formulario no se cierra.
- **Sesión expirada:** modal "Tu sesión expiró, inicia sesión de nuevo" sin redirección automática.
- **Validaciones de input:** descripción del hábito máx. 200 caracteres; ejercicio y grupo muscular máx. 100 caracteres; nombre de hábito y cantidad de hábitos sin límite definido en spec.
- **Variables de entorno:** `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Migraciones:** en `/supabase/migrations`, versionadas en el repo, aplicadas con `supabase db push`.

### Ronda 4 — Consistencia de scope vs brief

- **Mobile nativo / PWA:** no-goal explícito. Brief no modificado.
- **Gamificación:** brief modificado — entran badges persistidos por hitos de racha (7 y 30 días) y animaciones de celebración. Sin puntos ni niveles.
- **Notificaciones:** no-goal explícito. Brief no modificado.
- **Compartir social:** no-goal explícito. Sharing limitado a portapapeles + Web Share API con fallback. Sin páginas públicas ni interacción entre cuentas. Sin exportación de imagen.
- **Animaciones:** brief modificado — animaciones de celebración en hitos/badges y microinteracciones generales. Sin ilustraciones custom ni sistema de diseño elaborado.
