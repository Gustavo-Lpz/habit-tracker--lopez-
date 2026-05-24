# SETUP.md — Prerrequisitos antes de ejecutar T01

Lee este documento de arriba a abajo antes de tocar código.
Al terminar, el checklist del final confirma que puedes ejecutar T01.

---

## 1. Prerrequisitos de sistema

Instala esto en tu máquina si no lo tienes:

| Herramienta | Versión mínima | Cómo verificar |
|---|---|---|
| Node.js | 18.x | `node -v` |
| npm | 9.x | `npm -v` |
| Git | cualquiera | `git --version` |
| Supabase CLI | última | `supabase --version` |

**Instalar Supabase CLI:**
```bash
npm install -g supabase
```
Verifica: `supabase --version` debe devolver un número de versión.

---

## 2. Cuentas necesarias

| Servicio | Para qué | Cuándo se necesita |
|---|---|---|
| [supabase.com](https://supabase.com) | Base de datos + Auth (dev y prod) | Antes de T01 |
| [vercel.com](https://vercel.com) | Deploy de producción | Solo en T15 — no ahora |

La extensión "share progress" usa APIs nativas del navegador (Clipboard API y Web Share API). **No requiere ninguna cuenta ni llave adicional.**

---

## 3. Crear el proyecto Supabase de DESARROLLO

Este proyecto es el que corre en tu máquina local.

1. Ir a [supabase.com/dashboard](https://supabase.com/dashboard) e iniciar sesión.
2. Clic en **New project**.
3. Nombre sugerido: `habit-tracker-dev`.
4. Elige una contraseña de base de datos (guárdala, la necesitarás si conectas un cliente SQL directo).
5. Selecciona la región más cercana a ti.
6. Espera ~2 minutos a que el proyecto termine de inicializarse.

**Dónde están las variables:**
- En el dashboard, entra al proyecto `habit-tracker-dev`.
- Ve a **Settings → API** (menú lateral izquierdo).
- Copia los valores en `.env.local` (crea el archivo copiando `.env.example`):

| Variable | Dónde está en el dashboard |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sección **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sección **Project API keys** → fila **anon public** |

`.env.local` resultante:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> `.env.local` está en `.gitignore`. Nunca lo commitees.

---

## 4. Vincular el proyecto DEV al Supabase CLI

El CLI necesita saber a qué proyecto aplicar las migraciones SQL (tarea T03a).

1. En el dashboard del proyecto `habit-tracker-dev`, ve a **Settings → General**.
2. Copia el **Reference ID** (string de 20 caracteres, ej. `abcdefghijklmnopqrst`).
3. Ejecuta en la raíz del proyecto:
```bash
supabase login          # abre el navegador para autenticarte
supabase init           # crea la carpeta supabase/ si no existe
supabase link --project-ref <reference-id>
```
4. Verifica: `supabase status` debe mostrar el proyecto vinculado sin error.

> Esto se ejecuta **en T03a**, no en T01. El paso de aquí es solo reunir el Reference ID.

---

## 5. Crear el proyecto Supabase de PRODUCCIÓN

Este proyecto es el que usará Vercel en el deploy final (T15).

1. Vuelve al dashboard y crea un segundo proyecto: nombre sugerido `habit-tracker-prod`.
2. Espera a que inicialice.
3. Anota las variables en un lugar seguro (gestor de contraseñas o variable de entorno en Vercel):

| Variable | Valor de producción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto prod |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key del proyecto prod |

> Estas variables **no** van en `.env.local`. Se configuran en el dashboard de Vercel cuando llegues a T15.

---

## 6. Servicios externos de la extensión

La extensión "share progress" del proyecto usa:

- **Clipboard API** (`navigator.clipboard.writeText`) — nativa del navegador, sin configuración.
- **Web Share API** (`navigator.share`) — nativa del navegador, sin configuración.

**No hay llaves adicionales que reunir.**

---

## Checklist — la tarea T01 puede ejecutarse

Marca cada ítem antes de arrancar:

- [ ] Node.js 18+ instalado (`node -v`)
- [ ] npm 9+ instalado (`npm -v`)
- [ ] Git instalado (`git --version`)
- [ ] Supabase CLI instalado (`supabase --version`)
- [ ] Cuenta en supabase.com creada y con sesión activa
- [ ] Proyecto `habit-tracker-dev` creado en Supabase y completamente inicializado
- [ ] `NEXT_PUBLIC_SUPABASE_URL` copiado del proyecto DEV
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` copiado del proyecto DEV
- [ ] Archivo `.env.local` creado en la raíz del proyecto con los dos valores anteriores
- [ ] Reference ID del proyecto DEV anotado (para usar en T03a con `supabase link`)
- [ ] Proyecto `habit-tracker-prod` creado y sus variables guardadas en lugar seguro (para T15)
