# Brief: Habit Tracker de Entrenamiento

## 1. El problema

Las personas que entrenan de forma regular —corredores, ciclistas, personas con
rutinas de gimnasio o movilidad— necesitan una forma simple de registrar si cada
día entrenaron o descansaron y ver de un vistazo cuántos días consecutivos llevan
siendo constantes. No buscan análisis avanzados ni planes de periodización: buscan
confirmar su hábito y no perder la racha.

Las soluciones existentes no cubren bien esta necesidad. Las apps deportivas como
Strava o Garmin Connect apuntan a un perfil técnico y requieren datos de actividad
detallados. Las herramientas genéricas como Notion o planillas exigen configuración
antes de ser útiles y no tienen racha automática. No existe un punto medio: una
herramienta de entrada rápida cuyo único foco sea registrar el hábito de moverse
y mostrar la constancia acumulada.

## 2. Núcleo obligatorio

1. **Autenticación de usuario**
   El sistema permite crear cuenta e iniciar sesión. Cada usuario ve y edita
   únicamente sus propios registros. Se usa Supabase Auth como proveedor.

2. **Registro diario de sesión**
   El usuario marca cada día como entrenamiento o descanso, opcionalmente con
   el tipo de actividad y una nota breve de texto libre.
   Decisiones abiertas: ¿Se permite registrar dias pasados y hasta cuantos dias
   atras? ¿El tipo de actividad es una lista fija, una lista editable por el
   usuario, o texto libre sin estructura?

3. **Historial de sesiones**
   Vista de registros anteriores navegable por semanas o meses. El usuario puede
   ver el detalle de cualquier dia pasado.
   Decisiones abiertas: ¿El historial tiene un limite de tiempo o es ilimitado?
   ¿Se puede editar o eliminar un registro ya guardado, o es inmutable?

4. **Visualizacion de racha**
   Indicador prominente de los dias consecutivos de entrenamiento activos. La
   definicion exacta de que rompe o mantiene la racha se cierra en la spec.
   Decisiones abiertas: ¿Un dia de descanso rompe la racha o la preserva? ¿Se
   expone tambien la racha mas larga historica del usuario?

5. **Dashboard principal**
   Pantalla central que muestra el estado del dia de hoy, la racha actual y
   acceso directo al historial. Es el punto de entrada de cada sesion de uso.

## 3. Extensiones (elegir maxima 1)

| Nombre                  | Descripcion                                                                    |
|-------------------------|--------------------------------------------------------------------------------|
| Recordatorio diario     | El usuario configura una hora y recibe notificacion si no registro su sesion.  |
| Exportacion de datos    | El usuario descarga su historial completo en CSV o JSON.                       |
| Metas semanales         | El usuario define cuantos dias por semana quiere entrenar y ve su avance.      |
| Perfil publico          | Enlace de solo lectura compartible con la racha e historial reciente.          |
| Estadisticas por tipo   | Graficos de distribucion mensual de sesiones agrupadas por tipo de actividad.  |
| Modo compañero          | Dos usuarios se vinculan para ver las rachas del otro mutuamente.              |
| Calendario de heatmap   | Vista anual estilo GitHub contributions con intensidad por dias de actividad.  |

## 4. Restricciones tecnicas

- Framework: Next.js 15 con App Router
- Base de datos y autenticacion: Supabase (Postgres + Auth)
- Deploy: Vercel
- Lenguaje: TypeScript estricto
- Estilos: Tailwind CSS
- Equipo: un developer dirigiendo agentes de IA
- Alcance: equivalente a 2-3 semanas de trabajo enfocado

## 5. Lo que NO se evalua

- Diseno visual premium: sin sistema de diseno, ilustraciones ni animaciones.
- Performance avanzada: sin requisitos de Core Web Vitals mas alla de los defaults
  de Next.js.
- Tests automatizados: no hay cobertura de tests requerida.
- Responsive optimizado: el producto prioriza escritorio; mobile debe ser funcional
  pero no pulido.
- Accesibilidad avanzada: no se evalua cumplimiento WCAG mas alla de contraste basico.
