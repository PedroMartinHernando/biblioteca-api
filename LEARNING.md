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

## Herramientas y depuración (sesiones 1-3)

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

## Sesión 4 — Update y delete: actualización parcial y borrado con relaciones

**`PartialType` para actualizaciones parciales reales**

- Un `PATCH` debería permitir enviar solo los campos que cambian, no
  obligar a reenviar el recurso completo como en el `create`.
- `@nestjs/mapped-types` da `PartialType(CreateBookDto)`: genera una nueva
  clase (`UpdateBookDto`) con los mismos campos y decoradores de
  validación, pero todos marcados como opcionales automáticamente — sin
  duplicar el DTO a mano.
- En el `service`, cada campo se comprueba con `!== undefined` antes de
  tocarlo, para que un campo ausente en la petición no sobrescriba lo que
  ya había en la base de datos.

**Actualizar relaciones no es lo mismo que actualizar columnas simples**

- `this.repository.update(id, {...})` solo sirve para columnas normales —
  no sabe reasignar relaciones (`@ManyToOne`, `@ManyToMany`). Intentar
  pasarle `authorId` o `genreIds` ahí no funciona.
- Para tocar relaciones, hay que cargar la entidad completa (con
  `findOne({ where: { id }, relations: [...] })`), modificar sus campos en
  memoria (incluyendo asignar objetos de entidad reales a los campos de
  relación), y guardar con `save()` — este sí sabe gestionar tanto
  columnas simples como relaciones a la vez.

**Validar relaciones al actualizar: mismos huecos que en `create`**

- `findBy({ id: In([...]) })` no falla si algún ID no existe — solo
  devuelve menos filas de las pedidas, en silencio. Hay que comparar
  `resultado.length` contra la cantidad de IDs pedidos para detectar que
  falta alguno y lanzar `NotFoundException` explícitamente.
- IDs duplicados en la petición (`genreIds: [4, 4]`) distorsionan esa
  comparación. Dos formas de resolverlo: deduplicar en el service, o
  rechazar la petición desde el propio DTO con `@ArrayUnique()` de
  `class-validator` — más honesto, porque comunica al cliente que su
  petición estaba mal formada en vez de "arreglarla" en silencio.

**"Asumir" vs "confirmar" el resultado de un `update`**

- Tras `this.repository.update(id, {...})`, devolver el objeto que se
  cargó *antes* del `update` significa devolver datos desactualizados —
  el cambio se guardó en la base de datos, pero la respuesta al cliente
  muestra el valor viejo.
- Reconstruir el campo actualizado a mano en el objeto en memoria
  (`author.name = updateDto.name`) es más barato (una consulta menos) pero
  es una suposición: asume que el `UPDATE` hizo exactamente lo pedido.
- Releer con una segunda consulta tras el `update` (`findOneBy({ id })`)
  es más caro pero confirma de verdad el estado real en base de datos, en
  vez de asumirlo. Para una API cuya exactitud importa, es la opción más
  robusta, aunque cueste una consulta extra.
- Optimizar este tipo de detalle (evitar una consulta de más) solo tiene
  sentido en sistemas con tráfico alto — en un proyecto de este tamaño, la
  seguridad de "confirmar" vale más que el ahorro de "asumir".

**Reordenar comprobaciones para evitar trabajo innecesario**

- Comprobar primero si un recurso existe (`findOne`) y solo *después*
  intentar `update()` evita ejecutar un `UPDATE` que sabes de antemano que
  no va a encontrar nada que actualizar, cuando el `id` no existe.
- Es una optimización menor en proyectos pequeños, pero un patrón real que
  importa en sistemas con más volumen de escritura.

**Decisiones de diseño distintas para relaciones "protegidas" al borrar**

Un mismo problema (¿qué pasa si borro algo que otra cosa referencia?)
puede resolverse de formas distintas y ambas correctas, según el
contexto de negocio:

- `Author` → `Book` (uno-a-muchos): `remove()` **rechaza** el borrado con
  `409 Conflict` si el autor tiene libros asociados. Obliga a una decisión
  explícita (borrar o reasignar los libros primero) antes de perder esa
  referencia — la opción más segura por defecto.
- `Book` ↔ `Genre` (muchos-a-muchos): `remove()` permite el borrado sin
  ninguna comprobación en el código. El libro sobrevive, solo pierde la
  conexión con ese género — resuelto a nivel de base de datos con
  `onDelete: 'CASCADE'` (ver más abajo), no con lógica en el service.
- Quedó anotado como ampliación futura un tercer enfoque (borrado en
  cascada explícito y opcional para `Author`, no por defecto) para cuando
  se quiera dar esa flexibilidad sin sacrificar la seguridad del `409`
  como comportamiento estándar.

**`onDelete` en `@ManyToMany`: cada lado de la relación controla su propia
clave foránea**

- La tabla intermedia tiene dos claves foráneas: una hacia la entidad
  propietaria (donde está `@JoinTable()`), otra hacia la entidad inversa.
  TypeORM NO comparte una única configuración de `onDelete` entre ambas.
- El `onDelete` que se ponga en el decorador `@ManyToMany` de **Book**
  controla qué pasa con la tabla intermedia cuando se borra un **libro**.
- El `onDelete` que se ponga en el decorador `@ManyToMany` de **Genre**
  (el lado inverso) controla qué pasa cuando se borra un **género**.
- Poner `onDelete: 'CASCADE'` solo en un lado no cubre el borrado desde el
  otro lado — hace falta declararlo en el lado correspondiente a la
  entidad que se quiere poder borrar sin que la relación lo bloquee.
- Sin `CASCADE` en el lado correcto, SQLite rechaza el `DELETE` a nivel de
  base de datos (protegiendo la integridad referencial), y como Nest no
  traduce ese tipo de error de forma amigable por defecto, se propaga como
  un `500 Internal Server Error` genérico en vez de un mensaje claro —
  fue exactamente el síntoma que costó depurar en esta sesión.
- Cambiar `onDelete` en una relación exige regenerar el esquema: con
  `synchronize: true`, basta con parar el servidor, borrar `db.sqlite`
  (confirmando con `ls -la` que desapareció de verdad) y arrancar de
  nuevo — TypeORM lo reconstruye desde las entidades.

## Pendiente

- Endpoints específicos `POST`/`DELETE /books/:id/genres/:genreId` para
  añadir o quitar un género individual sin reemplazar la lista completa.
- Posible ampliación futura: modo alternativo de borrado en cascada
  explícito para `Author` (no como comportamiento por defecto).
- Posible ampliación futura: entidad `Loan` (préstamos) — con quién y
  cuándo se prestó un libro.
- Proyecto aparte de práctica de SQL puro (sin ORM), para entender mejor
  qué genera TypeORM por debajo.
- Tests unitarios, bloqueados en ambos proyectos por el problema de
  compatibilidad entre NestJS 12 (ESM puro) y Jest.
