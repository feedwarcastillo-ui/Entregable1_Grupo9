# API REST - Usuarios y Mascotas

## Descripción

Proyecto desarrollado en Node.js con Express para gestionar usuarios y mascotas mediante una API REST.

La información se almacena localmente en archivos JSON y se utiliza Multer para la carga de imágenes.

El proyecto implementa persistencia asíncrona, hashing de contraseñas, carga de archivos y acceso a archivos estáticos.

## Tecnologías utilizadas

- Node.js
- Express.js
- Multer
- fs.promises
- Crypto
- JSON
- HTML
- Postman

## Estructura del proyecto

```text
├── public/
│   ├── index.html
│   └── img/
│       ├── users/
│       └── pets/
│
├── src/
│   ├── app.js
│   ├── middlewares/
│   │   └── multer.middleware.js
│   ├── routes/
│   │   ├── users.router.js
│   │   └── pets.router.js
│   ├── utils/
│   │   └── crypto.js
│   └── data/
│       ├── users.json
│       └── pets.json
│
├── package.json
└── README.md
```

## Instalación

Clonar o descargar el proyecto y abrir una terminal dentro de la carpeta principal.

Instalar las dependencias:

```bash
npm install
```

## Ejecutar el proyecto

Ejecutar:

```bash
node src/app.js
```

El servidor se inicia en:

```text
http://localhost:8080
```

## Archivos estáticos

La carpeta `public` se encuentra configurada mediante `express.static`.

Las imágenes almacenadas pueden consultarse directamente desde el navegador.

Ejemplo:

```text
http://localhost:8080/img/users/avatar-nombre.png
```

## Endpoints de usuarios

### Obtener todos los usuarios

```http
GET /api/users
```

Retorna todos los usuarios sin mostrar sus contraseñas.

### Obtener usuario por ID

```http
GET /api/users/:id
```

Ejemplo:

```text
GET http://localhost:8080/api/users/1
```

### Crear usuario

```http
POST /api/users
```

La petición debe utilizar `multipart/form-data`.

Campos:

```text
firstname
lastname
username
password
avatar
```

El campo `avatar` debe enviarse como archivo.

La contraseña es procesada con el módulo `crypto` antes de almacenarse.

### Actualizar usuario

```http
PUT /api/users/:id
```

Permite modificar:

```text
firstname
lastname
username
password
avatar
```

Si se modifica la contraseña, esta se procesa nuevamente mediante hashing.

Si se proporciona un nuevo avatar, se reemplaza el archivo anterior.

### Eliminar usuario

```http
DELETE /api/users/:id
```

Elimina el usuario correspondiente del archivo `users.json`.

## Endpoints de mascotas

### Obtener todas las mascotas

```http
GET /api/pets
```

### Obtener mascota por ID

```http
GET /api/pets/:id
```

Ejemplo:

```text
GET http://localhost:8080/api/pets/1
```

### Crear mascota

```http
POST /api/pets
```

La petición debe utilizar `multipart/form-data`.

Campos:

```text
especie
color
edad
sexo
img
```

El campo `img` permite cargar hasta cinco imágenes.

### Actualizar mascota

```http
PUT /api/pets/:id
```

Permite actualizar los datos de la mascota y sus imágenes.

### Eliminar mascota

```http
DELETE /api/pets/:id
```

Elimina la mascota correspondiente del archivo `pets.json`.

## Persistencia

La información de los usuarios se almacena en:

```text
src/data/users.json
```

La información de las mascotas se almacena en:

```text
src/data/pets.json
```

Las operaciones de lectura y escritura se realizan utilizando `fs.promises` junto con `async/await`.

## Seguridad

Las contraseñas no se almacenan en texto plano.

Se utiliza el módulo nativo `crypto` de Node.js para realizar el hashing de las contraseñas.

Además, las respuestas de las solicitudes GET de usuarios no incluyen el campo `password`.

## Carga de imágenes

La carga de archivos se realiza mediante Multer utilizando:

```javascript
multer.diskStorage()
```

Los avatares de usuarios se almacenan en:

```text
public/img/users
```

Las imágenes de mascotas se almacenan en:

```text
public/img/pets
```

## Códigos de estado HTTP

El proyecto utiliza los siguientes códigos:

```text
200 OK
Consultas, actualizaciones y eliminaciones exitosas.

201 Created
Creación exitosa de usuarios o mascotas.

400 Bad Request
Datos faltantes o inválidos.

404 Not Found
Usuario, mascota o ruta no encontrada.

500 Internal Server Error
Error interno o problemas de lectura/escritura.
```

## Pruebas

Los endpoints de la API pueden probarse utilizando Postman.

También se incluye un archivo:

```text
public/index.html
```

que permite realizar una consulta básica de usuarios y mascotas y visualizar las imágenes almacenadas.

## Autores

Grupo 9