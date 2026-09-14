# NutriFit Backend

API de NutriFit desarrollada con NestJS, TypeORM y TypeScript.

## Inicio local

```bash
npm install
cp .env.example .env
npm run start:dev
```

Por defecto usa SQLite y crea el archivo local `data/nutrifit.sqlite`. La API queda disponible en <http://localhost:3000>.

## Configuración de base de datos

La configuración se lee desde `.env`. `.env` no se versiona; use `.env.example` como referencia.

SQLite:

```dotenv
DB_TYPE=sqlite
DB_DATABASE=data/nutrifit.sqlite
DB_SYNCHRONIZE=true
DB_LOGGING=false
```

PostgreSQL:

```dotenv
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=nutrifit
DB_PASSWORD=una_clave_segura
DB_DATABASE=nutrifit
DB_SYNCHRONIZE=true
DB_LOGGING=false
```

`DB_SYNCHRONIZE=true` es conveniente durante el desarrollo. Antes de producción debe cambiarse a `false` y manejar la estructura mediante migraciones. `DB_LOGGING=true` muestra las consultas SQL y es útil solo para depuración.

Al iniciar, la aplicación valida `PORT`, `DB_TYPE`, `DB_SYNCHRONIZE` y `DB_LOGGING`. Si usa PostgreSQL, también exige host, puerto, usuario, contraseña y base de datos para evitar que el servidor arranque con una configuración incompleta.

## Endpoints de usuarios

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/users` | Crea un usuario activo. |
| `GET` | `/users` | Lista usuarios activos. |
| `GET` | `/users/:id` | Obtiene un usuario activo. |
| `PUT` | `/users/:id` | Actualiza campos del usuario. |
| `DELETE` | `/users/:id` | Desactiva el usuario sin borrarlo de la base de datos. |

Ejemplo de creación:

```http
POST /users
Content-Type: application/json

{
  "id": "1234567890",
  "name": "Carlos Tello",
  "email": "carlos@ejemplo.com",
  "age": 30,
  "phone": "+573101234567"
}
```

El número de identificación (`id`) es obligatorio, solo acepta entre 5 y 20 dígitos y debe ser único. El correo electrónico también debe ser único. La API valida cuerpos, elimina campos no permitidos y rechaza valores inválidos.

## Verificación

```bash
npm run format
npm run lint
npm run build
```
