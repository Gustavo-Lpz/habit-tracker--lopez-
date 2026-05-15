# Extensión Elegida

# spec.md — Fitness Habit Tracker

## Objetivo

Aplicación web para que personas que entrenan regularmente registren sus sesiones de entrenamiento o descanso, consulten su historial y visualicen su racha de constancia.

---

## Scope

**Qué SÍ entra en este proyecto:**

- Registro y autenticación de usuarios con email y contraseña
- CRUD de hábitos (nombre, descripción, frecuencia diaria o semanal)
- Check-in diario: el usuario indica si entrenó o descansó en un día dado
- Check-in retroactivo: el usuario puede registrar entrenamientos de días anteriores
- Registro de detalle por sesión: grupo muscular trabajado, ejercicios realizados y pesos utilizados
- Consulta de check-ins existentes (sin posibilidad de editarlos ni eliminarlos)
- Historial de entrenamientos del usuario autenticado
- Registro de pesos máximos alcanzados por ejercicio
- Vista de progreso con racha actual de días entrenados consecutivos (un día sin check-in corta la racha)
- Compartir progreso mediante un resumen copiable en texto plano que incluye días entrenados y pesos máximos

**Qué NO entra (no-goals):**

- Edición o eliminación de check-ins ya guardados
- Ver ni interactuar con datos de otros usuarios
- Planes de entrenamiento generados automáticamente o sugerencias de rutinas
- Integración con wearables o apps externas (Apple Health, Google Fit, Strava, etc.)
- Notificaciones push, recordatorios o emails automatizados
- Análisis avanzado de rendimiento (volumen total, progresión por período, 1RM estimado, gráficas comparativas)

---

## Criterios de aceptación

**Autenticación**

1. Dado que el usuario no tiene cuenta, cuando completa el formulario de registro con email y contraseña válidos y lo envía, entonces se crea su cuenta y queda autenticado en la aplicación.
2. Dado que el usuario tiene cuenta, cuando ingresa email y contraseña correctos en el formulario de login, entonces accede a su sesión autenticada.
3. Dado que el usuario está autenticado, cuando ejecuta la acción de logout, entonces su sesión termina y es redirigido a la pantalla de login.
4. Dado que alguien intenta acceder a una pantalla protegida sin sesión activa, cuando navega a esa URL, entonces es redirigido al login sin ver contenido protegido.

**CRUD de hábitos**

5. Dado que el usuario está autenticado, cuando crea un hábito con nombre, descripción y frecuencia (diaria o semanal), entonces el hábito aparece en su lista de hábitos.
6. Dado que el usuario tiene hábitos creados, cuando edita el nombre, descripción o frecuencia de uno, entonces el hábito refleja los nuevos valores en la lista.
7. Dado que el usuario tiene hábitos creados, cuando elimina uno, entonces ese hábito desaparece de su lista y no es posible hacer check-in sobre él.
8. Dado que el usuario no tiene hábitos creados, cuando accede a la lista de hábitos, entonces ve un estado vacío sin error.

**Check-in diario y retroactivo**

9. Dado que el usuario tiene al menos un hábito activo, cuando realiza check-in para el día actual, entonces puede indicar si ese día entrenó o descansó.
10. Dado que el usuario marca un día como entrenamiento, cuando completa el registro de la sesión, entonces puede ingresar al menos un grupo muscular trabajado, los ejercicios realizados y el peso utilizado en cada ejercicio.
11. Dado que el usuario marca un día como descanso, cuando guarda el check-in, entonces ese día queda registrado como descanso sin requerir datos de ejercicios.
12. Dado que el usuario quiere registrar un entrenamiento de un día anterior, cuando selecciona una fecha pasada y completa el check-in, entonces el registro queda guardado con esa fecha, no con la fecha actual.
13. Dado que el usuario ya realizó check-in en un día, cuando vuelve a ese día, entonces puede consultar el registro existente pero no modificarlo ni eliminarlo.
14. Dado que un día ya tiene check-in guardado, cuando el usuario intenta crear un nuevo check-in para esa misma fecha, entonces el sistema no lo permite y muestra el registro existente.

**Historial y pesos máximos**

15. Dado que el usuario tiene check-ins de entrenamiento guardados, cuando accede al historial, entonces ve sus sesiones pasadas con la fecha, grupo muscular, ejercicios y pesos registrados.
16. Dado que el usuario ha registrado el mismo ejercicio en varias sesiones con distintos pesos, cuando consulta los pesos máximos, entonces el sistema muestra el mayor peso registrado para ese ejercicio, asociado únicamente a su cuenta.

**Vista de progreso y racha**

17. Dado que el usuario tiene check-ins de entrenamiento en días consecutivos, cuando accede a la vista de progreso, entonces ve su racha actual expresada como el número de días consecutivos más recientes en que marcó entrenamiento.
18. Dado que el usuario tiene un día marcado como descanso dentro de una secuencia de entrenamientos, cuando consulta la racha, entonces la racha actual sólo cuenta los días consecutivos de entrenamiento desde ese descanso hacia adelante.
19. Dado que el usuario tiene un día sin ningún check-in dentro de una secuencia de entrenamientos, cuando consulta la racha, entonces ese día sin check-in corta la racha y la racha actual sólo cuenta los días consecutivos de entrenamiento posteriores a ese día vacío.

**Compartir progreso**

20. Dado que el usuario está en la vista de progreso, cuando activa la opción de compartir, entonces el sistema genera un resumen en texto plano que el usuario puede copiar al portapapeles, que incluye el total de días entrenados y los pesos máximos alcanzados por ejercicio.

---

## No-goals

1. **Edición o borrado de check-ins:** Una vez guardado un check-in, no puede modificarse ni eliminarse; solo puede consultarse.
2. **Interacción social:** No existe feed, seguimiento de otros usuarios ni ninguna forma de interacción entre cuentas.
3. **Generación automática de contenido:** La app no sugiere rutinas, ejercicios, pesos ni planes de entrenamiento.
4. **Integración con plataformas externas:** No hay conexión con wearables, apps de salud ni servicios de terceros.
5. **Notificaciones automatizadas:** No se envían alertas, recordatorios ni emails de seguimiento.
6. **Análisis avanzado de rendimiento:** No hay gráficas de volumen, comparativas entre períodos ni cálculos derivados como el 1RM estimado.
