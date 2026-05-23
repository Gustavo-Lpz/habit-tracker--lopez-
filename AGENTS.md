# AGENTS.md — Contrato del proyecto Habit Tracker

Fuente de verdad para agentes y developers. Toda decision de diseno,
tecnologia y proceso queda cerrada aqui salvo revision explicita del equipo.

---

## Stack

- Next.js 15 con App Router (no Pages Router)
- Supabase: Postgres, Auth y Storage
- TypeScript 5 en modo strict
- Tailwind CSS para estilos
- Vercel para deploy

---

## Convenciones de TypeScript

- `strict: true` en tsconfig. Sin excepciones.
- Prohibido usar `any` sin comentario que justifique por qué es inevitable.
- Preferir tipos explícitos sobre inferencia en firmas de funciones públicas.
- Interfaces para contratos de datos, `type` para uniones y aliases.

---

## Estructura de carpetas esperada

```
app/                  # Rutas y layouts (App Router)
  (auth)/             # Grupo: login, registro
  (app)/              # Grupo: rutas protegidas
components/           # Componentes reutilizables
  ui/                 # Primitivos sin lógica de negocio
lib/                  # Utilidades, clientes Supabase, helpers
  supabase/
actions/              # Server Actions de Next.js
types/                # Tipos e interfaces globales
docs/
  adr/                # Architecture Decision Records
insumos/              # Documentos de referencia, no se modifican
```

---

## Politica de commits

- Un commit por unidad funcional. Prohibidos los commits "implement everything".
- Formato: `<tipo>(<alcance>): <descripcion en infinitivo>` — en español.
- Tipos permitidos: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`.
- El mensaje describe la intención, no los archivos tocados.
- Ejemplos: `feat(auth): agregar formulario de registro`,
  `chore(deps): instalar supabase-js`, `docs(adr): registrar decision de RLS`.

---

## Flujo git (Gitflow)

- `main` — rama estable; solo recibe merges desde `develop` tras validacion.
- `develop` — rama de integración; toda rama tipada se mergea aquí.
- Ramas de trabajo tipadas:
  - `feat/<nombre>`   — nueva funcionalidad
  - `fix/<nombre>`    — correccion de bug
  - `chore/<nombre>`  — tareas de infraestructura o configuracion
  - `docs/<nombre>`   — documentacion
- Flujo: crear desde `develop` → trabajar → mergear a `develop` → eliminar rama.
- Nada se queda sin commitear ni sin mergear al finalizar una unidad.

---

## Regla de CONTEXT.md

Cualquier edicion manual de codigo que no haya sido generada por un agente
debe registrarse en `CONTEXT.md` con:
1. Fecha
2. Archivo(s) modificados
3. Justificacion del cambio manual

---

## Prohibiciones explicitas

- `any` sin comentario justificativo.
- Librerias de componentes pesadas (Material UI, Chakra UI, Ant Design,
  shadcn si implica copiar cientos de archivos generados).
- Tests automatizados: fuera del alcance de este proyecto.
- Pages Router de Next.js: el proyecto usa exclusivamente App Router.
- Bypass de RLS en Supabase: las politicas de Row-Level Security son
  innegociables; nunca usar la service role key en el cliente.
- Commits con cambios mixtos de distintas unidades funcionales.

---

## Agentes reconocidos

`arquitecto` — ADRs y estructura. `disenador` — UI con Tailwind.
`qa` — criterios de aceptacion. `reviewer` — code review pre-merge.
`implementer` — escritura de codigo segun plan aprobado.

Ningun agente escribe codigo sin un plan aprobado previamente.
