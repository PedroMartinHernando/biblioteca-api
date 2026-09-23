# Notas de aprendizaje — Proyecto Biblioteca API

## Sesión 1 — Setup y CRUD básico de Author

- Esqueleto NestJS generado en modo **CJS**, no ESM, a propósito: NestJS 12
  publica sus paquetes como ESM puro, y Jest todavía no lo soporta bien.
  Generar el proyecto en CJS evita heredar ese problema desde el minuto uno
  (lección aprendida en el proyecto de notas).
- `AppController`/`AppService` reconvertidos en un **health check** simple
  (`GET /` → `{ status: 'ok' }`), en vez de reutilizar la raíz para un
  recurso concreto. La raíz de una API REST no debería "pertenecer" a
  ningún recurso — cada uno tiene su propia ruta (`/authors`, `/books`...).
- CRUD básico de `Author` (entidad, DTO con `class-validator`, `findAll`/
  `create`) replicando el patrón ya dominado en el proyecto de notas.
- **Nomenclatura de entidades**: el fichero y la clase de la entidad van en
  **singular** (`Author`, `author.entity.ts`) porque representan una fila
  individual. Todo lo demás dentro de la misma carpeta (módulo, controller,
  service, nombre de la carpeta) va en **plural**, porque manejan la
  colección. Mismo patrón que ya tenía `Note`/`notes/` sin que se hubiera
  hecho explícito antes.

## Sesión 2 — Relaciones entre entidades: el concepto central del proyecto

**Uno-a-muchos / muchos-a-uno (`Author` ↔ `Book`)**

- A nivel de base de datos es una **clave foránea**: la tabla `book` tiene
  una columna `authorId` que apunta a `author.id`. Es la misma relación
  física vista desde dos ángulos.
- `@ManyToOne(() => Author, (author) => author.books)` en `Book` — genera
  la columna `authorId` con su `FOREIGN KEY`.
- `@OneToMany(() => Book, (book) => book.author)` en `Author` — **no**
  genera ninguna columna nueva. Es azúcar sintáctico: permite escribir
  `author.books` en código y que TypeORM ejecute por debajo un
  `SELECT * FROM book WHERE authorId = ...` automáticamente.

**Muchos-a-muchos (`Book` ↔ `Genre`)**

- Ninguna de las dos tablas puede tener una columna simple, porque la
  relación va en ambas direcciones con múltiples valores. Hace falta una
  **tabla intermedia** (aquí, `book_genres_genre`), con dos columnas
  (`bookId`, `genreId`) y una **clave primaria compuesta**:
  `PRIMARY KEY (bookId, genreId)`. Esto impide duplicar la misma relación,
  sin necesitar una columna `id` propia que no aportaría significado.
- `@JoinTable()` va **solo en un lado** de la relación (el "propietario" —
  aquí, en `Book`). Le dice a TypeORM "crea y gestiona la tabla intermedia
  aquí". Ponerlo en los dos lados crearía dos tablas intermedias distintas
  y desincronizadas — es un error real, no de estilo.
- El lado inverso (`Genre`, sin `@JoinTable()`) simplemente consulta la
  misma tabla que ya gestiona el lado propietario.

**La función `(book) => book.genres` — por qué existe**

- El primer argumento del decorador (`() => Book`) envuelve la clase en una
  función para evitar un problema de carga circular entre dos ficheros que
  se necesitan mutuamente (**lazy evaluation**: se resuelve más tarde, no
  al cargar el fichero).
- El segundo argumento (`(book) => book.genres`) no se ejecuta nunca con un
  libro real. TypeORM le pasa un objeto "trampa" que detecta qué propiedad
  se intentó leer (`genres`) y usa ese nombre internamente. Esto existe
  para que TypeScript pueda **verificar en tiempo de compilación** que el
  campo existe de verdad — algo que un simple string (`'genres'`) no
  permitiría comprobar.

## Sesión 3 — Usar las relaciones de verdad: `create` y `find`

- Para crear un libro asociado a un autor y géneros ya existentes, el DTO
  recibe **IDs**, no objetos completos: `authorId: number`,
  `genreIds: number[]`.
- El `service` necesita inyectar los repositories de **las tres entidades**
  relacionadas (`Book`, `Author`, `Genre`), no solo el suyo propio — y
  registrarlas todas en el `forFeature` del módulo.
- Antes de crear el libro: buscar el `Author` real con `findOneBy` (con
  manejo de `null` → `NotFoundException`, igual que en notas) y los
  `Genre` reales con `findBy({ id: In([...]) })` — el operador `In` de
  TypeORM permite buscar varias filas por una lista de IDs a la vez.
- **Trampa real que costó depurar**: olvidar el `await` en `findOneBy`/
  `findBy` deja la variable como una `Promise` sin resolver, y al pasarla a
  `create({...})` TypeScript da un error confuso (`'title' does not exist
  in type DeepPartial<Book>[]`) que parece apuntar a un problema de array,
  cuando el problema real es la promesa sin `await`.
- **Las relaciones no se cargan automáticamente**. `find()` sin más solo
  trae las columnas propias de la entidad. Hace falta pedir
  `relations: ['author', 'genres']` explícitamente para que TypeORM añada
  los `JOIN` necesarios (uno directo contra `author`, y uno doble pasando
  por la tabla intermedia para llegar a `genre`) y reconstruya el
  resultado como JSON anidado.

## Herramientas y depuración

- **Problema de encoding en la terminal de Windows**: escribir tildes/ñ
  directamente en un comando `curl -d '...'` desde PowerShell o Git Bash
  puede corromper los caracteres al llegar a la API (`Distopía` →
  `Distop�a`), aunque el código del backend esté bien. La solución fiable
  es escribir el JSON en un fichero de texto (garantizado en UTF-8 por el
  editor) y usar `curl --data-binary @fichero.json` en vez de pasar el
  JSON directamente como texto en el comando.
- **Un `.gitignore` mal ajustado puede excluir código real sin avisar de
  forma obvia** — conviene revisar `git status` con atención tras crear
  ficheros nuevos, no asumir que "si no aparece, es que no ha cambiado".
- `db.sqlite` (el fichero real de la base de datos) no debe trackearse en
  Git, por la misma razón que `dist/` o `*.tsbuildinfo`: es un artefacto
  generado y mutable, no código fuente.

## Pendiente

- Endpoints de actualización/borrado para `Book`, `Author`, `Genre`
  (patrón ya dominado desde el proyecto de notas).
- Posible ampliación futura: entidad `Loan` (préstamos) — con quién y
  cuándo se prestó un libro.
- Proyecto aparte de práctica de SQL puro (sin ORM), para entender mejor
  qué genera TypeORM por debajo.
- Tests unitarios, bloqueados en ambos proyectos por el problema de
  compatibilidad entre NestJS 12 (ESM puro) y Jest.
