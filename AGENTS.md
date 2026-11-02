# AGENTS.md

Protocolo único para cualquier agente que trabaje en este repositorio. No hay roles ni tareas asignadas por agente: todos siguen las mismas reglas y cualquiera puede tomar, continuar o terminar cualquier tarea.

## antes de tocar nada

Leé, en este orden:

1. `docs/plan/01-producto.md` — qué es la app y sus reglas de negocio.
2. `docs/plan/02-diseno.md` — cómo se ve. Es obligatorio para cualquier cosa visual.
3. `docs/plan/03-arquitectura.md` — stack, capas, contratos y comandos.
4. `docs/plan/04-tareas.md` — el tablero.
5. `docs/plan/decisiones.md` — decisiones tomadas en el camino.

El plan es el contrato. Si el código y el plan no coinciden, manda el plan; si el plan está mal, se corrige el plan primero (commit `docs:` propio) y después el código.

## ciclo de una tarea

### 1. elegir

Una tarea se puede tomar si su estado es `libre`, todas sus dependencias están `hecha` en `main` y no tiene candado. Si hay varias, tomá la de número más bajo. Si el dueño del proyecto te pidió una tarea concreta, tomá esa.

### 2. tomar el candado

Los candados viven dentro del directorio común de git, así se ven desde todos los worktrees y nunca se commitean. `mkdir` es atómico: si falla, alguien más la tiene.

```sh
CANDADOS="$(git rev-parse --path-format=absolute --git-common-dir)/anden-candados"
mkdir -p "$CANDADOS"
mkdir "$CANDADOS/T-012" || echo "tomada, elegí otra"
printf 'agente: %s\ndesde: %s\nrama: t/T-012-precio\n' "<tu nombre de agente>" "$(date -u +%FT%TZ)" > "$CANDADOS/T-012/dueno"
```

Si la tarea es `raíz: sí`, tomá también `mkdir "$CANDADOS/raiz"` y soltalo apenas hagas commit de los archivos compartidos (no al final de toda la tarea).

### 3. trabajar en tu worktree

Nunca se trabaja en el checkout principal; ese solo recibe integraciones.

```sh
git worktree add ../anden-wt/T-012 -b t/T-012-precio main
cd ../anden-wt/T-012 && pnpm install
```

### 4. dejar nota mientras trabajás

Después de cada commit, actualizá `$CANDADOS/T-012/nota.md` con tres líneas: qué está hecho, qué sigue, qué falta saber. Es lo que permite que otro agente continúe si vos parás.

### 5. integrar

Cuando la tarea cumple su "hecho cuando":

```sh
pnpm verificar                                  # en tu worktree, verde
mkdir "$CANDADOS/main"                          # turno para integrar; si falla, esperá
git rebase main && pnpm verificar               # de nuevo verde tras el rebase
git -C <checkout principal> merge --ff-only t/T-012-precio
rmdir "$CANDADOS/main"
```

El último commit de la tarea es `docs: cerrar T-012` cambiando su estado a `hecha` en `04-tareas.md`. Después: `rm -r "$CANDADOS/T-012"`, `git worktree remove ../anden-wt/T-012`, `git branch -d t/T-012-precio`.

Nada se sube a GitHub sin permiso explícito del dueño del proyecto.

## continuar la tarea de otro

Cualquier agente puede seguir una tarea empezada. Se retoma si el dueño del proyecto lo pide, o si el candado tiene más de 12 h y la rama no tiene commits nuevos en ese tiempo.

1. Leé `dueno` y `nota.md` del candado y `git log main..t/T-xxx` de la rama.
2. Agregá a `nota.md`: `retomada por <agente> <fecha>`.
3. Trabajá en el mismo worktree y la misma rama. No reescribas los commits que ya están.

## commits segmentados

Regla de fondo: un commit cuenta una sola cosa, y el proyecto compila y pasa sus pruebas en cada commit.

1. Planificá antes de programar: partí la tarea en pasos pequeños con resultado verificable (lógica pura, interfaz, cableado, pruebas, documentación). Los commits sugeridos del tablero son el mínimo, no el máximo (ver granularidad más abajo).
2. Un paso, un commit. Si para describirlo necesitás escribir "y", son dos commits.
3. La lógica sin dependencias va primero, con sus pruebas. Después, lo que la usa.
4. Cada commit deja el árbol sano. Antes de commitear, corré tipos y pruebas del área que tocaste. Si fallan, arreglá o separá; no se commitea roto.
5. Stageá con intención. Nada de `git add -A` a ciegas. Revisá `git status` y `git diff --staged`. Si un archivo mezcla dos ideas, separalas con `git add -p`. Un cambio que no pertenece a la tarea va en su propio commit.
6. Prefijos y mensaje:
   - `feat:` capacidad nueva
   - `fix:` corrección de un fallo (incluí la causa)
   - `docs:` documentación y plan
   - `test:` solo pruebas
   - `refactor:` sin cambio de comportamiento
   - `chore:` build, scripts, dependencias

   Una línea, en español, en minúsculas, que diga qué cambia y no cómo.
7. La documentación va aparte, en su propio commit `docs:` al final.
8. Sin atribución de IA: nada de `Co-Authored-By`, ni menciones a IA, modelos o agentes en commits, ramas, PRs, comentarios de código ni documentación pública.
9. Historia real: no falsear fechas ni simular actividad. Los commits son pequeños porque el trabajo se hizo por partes.
10. Subir solo con permiso. Nunca `--force`. Si un push es rechazado, `git fetch` y mirá qué hay antes de decidir. Desde una rama distinta de la principal: `git push origin HEAD:<rama>`, comprobando antes que es avance directo.

### granularidad: lo más segmentado posible, sin bajar la calidad

El dueño del proyecto quiere el historial más fino que el trabajo real permita. Antes de commitear, preguntate si lo que tenés en el índice todavía se puede partir en dos cosas que se entiendan solas. Si se puede, partilo.

Una tarea del tablero suele dar de 12 a 25 commits, no 2 o 3. La unidad mínima es una cosa que se entiende y se prueba sola. Ejemplos de dónde cortar:

- cada función, regla de negocio o constante es un commit `feat:`, y sus pruebas van después; cada caso de prueba (`it`) es un commit `test:` propio: el caso feliz, cada borde, cada error esperado.
- cada tipo, constante o esquema nuevo es su propio commit, antes de lo que lo usa.
- cada componente visual: estructura, estados (vacío, error, cargando), interacción y accesibilidad son commits separados.
- cada pantalla: primero el esqueleto con datos, después cada estado, después cada detalle de interacción.
- cada exportación nueva en un `index.ts`, cada mejora de formato o de nombres (`refactor:`), cada decisión escrita en `decisiones.md` (`docs:`) y cada tarea nueva que encuentres en el camino (`docs:`).

Lo que no vale, porque rompe la regla de fondo o inventa actividad:

- partir una función a la mitad, una línea suelta o un archivo que no compila por separado.
- commits vacíos, cambios de espacios sin motivo, o deshacer y rehacer lo mismo para sumar commits.
- empujar trabajo que ya está hecho en un solo bloque partiéndolo después con fechas distintas. Se commitea mientras se trabaja, paso a paso, con la fecha real.

Cada commit, por pequeño que sea, deja tipos, lint y pruebas del área en verde.

Flujo corto por paso:

```sh
pnpm -F <paquete> tipos && pnpm -F <paquete> test
git add <archivos del paso>
git diff --staged
git commit -m "feat: ..."
```

Al terminar la tarea, `pnpm verificar` completo antes de integrar.

## reglas de código

- TypeScript estricto. Sin `any` ni `@ts-ignore`; si no queda otra, `// motivo:` en la línea anterior.
- Las capas de `03-arquitectura.md` no se saltan: pantallas → hooks → contrato → dominio.
- Nombres en español, sin tildes ni ñ en identificadores (`pestanas`, `anio`); los textos visibles sí llevan tildes.
- Toda regla de negocio va en `packages/dominio` con prueba. Una pantalla nunca calcula un precio ni decide si un asiento está libre.
- Ningún color, tamaño de fuente ni duración fuera de `src/tema/`. Ningún texto visible fuera de `src/textos/es.ts`.
- Nada de emojis en código, textos, datos de muestra ni commits.
- La app no usa la cámara.
- Dependencia nueva: solo si la tarea lo dice, en su commit `chore:` propio y con el candado `raiz`.

## cuando algo no está claro

- No inventes alcance. Elegí la opción más simple que cumpla el plan, hacela y anotá la decisión en `docs/plan/decisiones.md` (fecha, tarea, decisión, por qué) en su propio commit `docs:`.
- Si la decisión cambia el producto, el diseño o un contrato público de `packages/datos`, no la tomes: dejala escrita en la nota del candado y en `decisiones.md` como pregunta abierta, soltá la tarea (o seguí con la parte que no depende) y avisale al dueño del proyecto.
- Si encontrás un fallo fuera de tu tarea, no lo arregles de pasada: agregalo al tablero como tarea nueva en un commit `docs:`.

## al terminar una sesión

Respondé al dueño del proyecto, corto: qué tarea, qué commits, si quedó integrada a `main`, qué verificaste y qué no, y qué tarea queda libre a continuación.
