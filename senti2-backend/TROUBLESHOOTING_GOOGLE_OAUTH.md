# Solución de Problemas - Google OAuth

## Pasos para diagnosticar el error

### 1. Verificar los logs de Laravel

```bash
# En PowerShell
Get-Content storage/logs/laravel.log -Tail 100 -Wait

# O simplemente abre el archivo
notepad storage/logs/laravel.log
```

Busca mensajes que contengan:
- "Callback de Google OAuth recibido"
- "Error al intercambiar código"
- "Error en OAuth de Google"

### 2. Verificar configuración en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **Authentication** > **URL Configuration**
3. Verifica que esté agregada la URL:
   ```
   http://localhost:8000/api/v1/auth/google/callback
   ```
4. También agrega:
   ```
   http://localhost:4200/auth/callback
   ```

### 3. Verificar configuración de Google OAuth en Supabase

1. Ve a **Authentication** > **Providers**
2. Verifica que **Google** esté habilitado
3. Verifica que las credenciales (Client ID y Client Secret) sean correctas
4. En Google Cloud Console, verifica que la URL de redirección autorizada sea:
   ```
   https://igzlyprmxmsijauhivir.supabase.co/auth/v1/callback
   ```

### 4. Verificar variables de entorno

En el archivo `.env` del backend, verifica:

```env
SUPABASE_URL=https://igzlyprmxmsijauhivir.supabase.co
SUPABASE_KEY=tu_clave_anon_key
FRONTEND_URL=http://localhost:4200
APP_URL=http://localhost:8000
```

### 5. Probar el flujo manualmente

1. Inicia el servidor Laravel:
   ```bash
   php artisan serve
   ```

2. Abre el navegador y ve a:
   ```
   http://localhost:8000/api/v1/auth/google/url
   ```

3. Deberías ver una respuesta JSON con la URL de OAuth

4. Copia esa URL y ábrela en el navegador

5. Después de autenticarte con Google, deberías ser redirigido al callback

### 6. Errores comunes

**Error: "No se recibió código de autorización"**
- Verifica que la URL de callback esté configurada en Supabase
- Verifica que la URL de callback coincida exactamente

**Error: "Error al intercambiar código por sesión"**
- Verifica que las credenciales de Supabase sean correctas
- Verifica que el código no haya expirado (intenta de nuevo)
- Revisa los logs para ver el error específico de Supabase

**Error: "Invalid redirect_uri"**
- Verifica que la URL de callback esté en Google Cloud Console
- Verifica que la URL coincida exactamente (sin trailing slash, con http/https correcto)

## Próximos pasos

Si después de seguir estos pasos sigue fallando, comparte:
1. El mensaje de error exacto de los logs
2. La respuesta del endpoint `/api/v1/auth/google/url`
3. La URL completa a la que te redirige después de autenticarte con Google

