# CONTINUAR.md — Guía de build

**Requisito previo:** BUILD-READY.md en ✅ y checklist de SETUP.md completo.

---

## Loop por tarea (repetir hasta T15)

```bash
git checkout develop && git pull origin develop
git checkout -b feat/T<N>-<nombre>

# Invocar implementer: "Ejecuta la tarea T<N> de plan.md"
# El agente confirma → lista archivos → espera aprobación → implementa.
# Opcionalmente invocar reviewer antes del commit.

git add <archivos>
git commit -m "feat(T<N>): <descripción>"
git checkout develop
git merge --no-ff feat/T<N>-<nombre> -m "chore(merge): integrar T<N>"
git branch -d feat/T<N>-<nombre>
```

Avanzar a la siguiente tarea solo cuando el **"Hecho cuando"** de la actual está verificado.

---

## Si el implementer se atora dos veces

El agente para y describe qué intentó. Tú aplicas la corrección manual y registras en `CONTEXT.md`:

```
Fecha · Archivo(s) · Qué cambió y por qué el agente no pudo hacerlo
```

Commiteas `CONTEXT.md` junto con el fix antes de continuar.

---

## Ramas especiales

| Cuándo | Rama | Origen → Destino |
|---|---|---|
| Deploy final (T15 completo, `npm run build` sin errores) | `release/v1.0` | `develop` → `main` + tag `v1.0.0` |
| Bug crítico en producción | `hotfix/<descripción>` | `main` → `main` y `develop` |

---

**Estado actual:** `develop` listo, 6 commits de andamiaje. Primera tarea: **T01**.
