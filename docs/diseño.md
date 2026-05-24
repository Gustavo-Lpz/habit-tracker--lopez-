# Sistema visual — Fitness Habit Tracker

## Paleta de colores

| Nombre semántico | Clase Tailwind | Justificación funcional |
|---|---|---|
| Primario | `violet-600` | Color de marca para CTAs, racha activa y badges; enérgico sin ser agresivo, diferenciado del verde de éxito. |
| Fondo | `gray-50` | Superficie base de la app; reduce carga visual en pantallas de historial y listas largas. |
| Texto | `gray-900` | Máximo contraste sobre `gray-50` y `white` sin usar pure black. |
| Éxito / entrenamiento | `emerald-500` | Señala días de training, confirmaciones y badges desbloqueados — verde = acción completada. |
| Error / racha perdida | `red-600` | Errores de validación e indicador de racha cortada; contraste suficiente sobre fondos claros. |

> **Color de descanso:** `amber-400`. Usado exclusivamente para check-ins de tipo `rest` en el historial y la vista de check-in. No es un token de sistema: nunca aparece en CTAs, errores ni navegación.

---

## Tipografía

**Familia:** `font-sans` — system font stack de Tailwind (SF Pro en macOS, Segoe UI en Windows). Sin instalación de fuentes externas.

**Justificación:** La spec prohíbe sistema de diseño elaborado. El system font stack es zero-config, carga instantáneo y produce UI familiar en cada plataforma sin dependencias adicionales.

| Nivel | Clases Tailwind | Uso |
|---|---|---|
| H1 de página | `text-2xl font-bold text-gray-900` | Título principal de cada pantalla |
| H2 de sección | `text-lg font-semibold text-gray-900` | Subtítulos internos (ej. "Tu racha", "Ejercicios") |
| Cuerpo | `text-base text-gray-900` | Contenido general y labels de formulario |
| Meta / secundario | `text-sm text-gray-500` | Fechas, descripciones de hábito, subtextos |
| Chip / badge | `text-xs font-medium` | Etiquetas de estado pequeñas (training, rest, hito) |

---

## Escala de espaciado

| Valor Tailwind | px | Rol semántico |
|---|---|---|
| `2` | 8 px | Separación entre elementos internos de un componente (icono + texto) |
| `4` | 16 px | Padding interno de componentes (botones, inputs, cards) |
| `6` | 24 px | Separación entre componentes dentro de una sección |
| `8` | 32 px | Separación entre secciones dentro de una página |
| `16` | 64 px | Padding del layout principal y márgenes del contenedor central |

---

## Inventario de componentes

### Primitivos — `components/ui/`

| Componente | Descripción | Variantes |
|---|---|---|
| `Button` | Botón de acción con estado loading | `primary` (violet-600) · `ghost` (borde, fondo transparente) · `destructive` (red-600) |
| `Input` | Campo de texto con label y slot de mensaje de error | — |
| `Textarea` | Área de texto multi-línea para descripción de hábito | — |
| `Badge` | Chip de estado pequeño | `training` (emerald-500) · `rest` (amber-400) · `unlocked` (violet-600) |
| `Card` | Contenedor de superficie blanca con sombra sutil (`shadow-sm`) | — |
| `Modal` | Overlay con panel centrado; cierra con ESC y click fuera | — |
| `Spinner` | Indicador de carga circular animado | — |
| `EmptyState` | Área para estado vacío con mensaje y acción opcional | — |
| `ErrorMessage` | Texto de error inline en `red-600`, siempre bajo el campo que lo originó | — |

### Compuestos — `components/`

| Componente | Descripción | Variantes |
|---|---|---|
| `NavBar` | Barra superior con links de navegación y botón de logout | — |
| `HabitCard` | Muestra nombre, descripción y frecuencia de un hábito con acciones editar / eliminar | — |
| `CheckInForm` | Selector training/rest con lista dinámica de `ExerciseRow` y botón guardar | — |
| `ExerciseRow` | Fila de un ejercicio: nombre, grupo muscular y peso en inputs inline | — |
| `CheckInReadOnly` | Muestra un check-in existente en modo solo lectura, sin botones de edición | — |
| `StreakCounter` | Muestra racha actual y mejor racha histórica; distingue "Sin registros aún" de racha perdida con texto diferente | — |
| `BadgeCard` | Muestra un badge desbloqueado con nombre y fecha de desbloqueo | — |
| `CelebrationOverlay` | Animación de celebración al momento de desbloquear un badge o alcanzar un hito de racha | — |
| `HistoryItem` | Fila del historial: fecha, nombre del hábito, grupos musculares, ejercicios y pesos | — |
| `ShareButton` | Copia al portapapeles + Web Share API con fallback silencioso si el navegador no la soporta | — |
| `SessionExpiredModal` | Modal "Tu sesión expiró, inicia sesión de nuevo" con botón a `/login`; no redirige automáticamente | — |

---

## Estructura de páginas

| Ruta | Layout | Componentes usados |
|---|---|---|
| `/login` | Columna centrada, sin NavBar | `Input` × 2, `Button (primary)`, `ErrorMessage` |
| `/signup` | Columna centrada, sin NavBar | `Input` × 2, `Button (primary)`, `ErrorMessage` |
| `/dashboard` | NavBar + columna de contenido | Stub T07b: `<h1>Dashboard</h1>` + párrafo placeholder. Sin componentes de datos — ningún CA exige contenido en esta ruta más allá de que exista sin 404. |
| `/habits` | NavBar + lista + botón fijo | lista de `HabitCard`, `EmptyState`, `Button (primary)` |
| `/habits/new` | NavBar + formulario centrado | `Input`, `Textarea`, `Input`, `Button (primary)`, `ErrorMessage` |
| `/habits/[id]/edit` | NavBar + formulario centrado | idéntico a `/habits/new` |
| `/checkin/[date]` | NavBar + formulario o lectura | `CheckInForm` + `ExerciseRow` + `Button` + `ErrorMessage`, o `CheckInReadOnly` según si ya existe check-in |
| `/history` | NavBar + lista scrolleable (SWR) | lista de `HistoryItem`, `EmptyState`, `Spinner` |
| `/progress` | NavBar + secciones apiladas | `StreakCounter`, lista de `BadgeCard`, `CelebrationOverlay`, `ShareButton` |

---

## Criterios de aceptación

- [ ] Todos los botones de acción principal usan `violet-600`; ningún otro color aparece en variante `primary`.
- [ ] El fondo de página es `gray-50` en todas las rutas protegidas.
- [ ] Los check-ins `training` se renderizan con `emerald-500`; los de tipo `rest` con `amber-400`. Los roles no se invierten.
- [ ] Los mensajes de error aparecen siempre debajo del campo que los originó en `red-600`; nunca en toast flotante ni alert global.
- [ ] El estado "Sin registros aún" en `/progress` muestra un texto diferente al estado de racha perdida, no solo un color distinto.
- [ ] Ningún archivo de fuente externo es importado; la tipografía usa exclusivamente `font-sans`.
- [ ] Todos los gaps, paddings y márgenes de la app usan los valores `2 / 4 / 6 / 8 / 16`; no hay valores ad-hoc (ej. `p-5`, `gap-7`).
- [ ] `CelebrationOverlay` se monta solo al momento de desbloquear un badge, no en visitas posteriores a `/progress`.
- [ ] `SessionExpiredModal` no redirige automáticamente; contiene solo el mensaje y un botón que navega a `/login`.
- [ ] Ninguna pantalla importa componentes de Material UI, Chakra UI, Ant Design ni shadcn.
