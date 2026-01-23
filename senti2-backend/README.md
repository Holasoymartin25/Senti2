# Senti2 Backend API

Backend Laravel para la aplicación Senti2.

## Instalación

1. Instalar dependencias:
```bash
composer install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` y agregar:
```
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_clave_de_supabase
```

3. Ejecutar migraciones:
```bash
php artisan migrate
```

4. Iniciar servidor:
```bash
php artisan serve
```

## Endpoints API

### Autenticación

- `POST /api/v1/auth/verify` - Verificar token de Supabase

### Perfil

- `GET /api/v1/profile` - Obtener perfil del usuario (requiere autenticación)
- `PUT /api/v1/profile` - Actualizar perfil del usuario (requiere autenticación)
- `PATCH /api/v1/profile` - Actualizar perfil del usuario (requiere autenticación)

## Autenticación

Todas las rutas protegidas requieren un token Bearer de Supabase en el header:

```
Authorization: Bearer {token}
```

## Estructura

- `app/Models/Profile.php` - Modelo de perfil
- `app/Http/Controllers/Api/` - Controladores API
- `app/Http/Middleware/VerifySupabaseToken.php` - Middleware de autenticación
- `routes/api.php` - Rutas API
- `database/migrations/` - Migraciones de base de datos
