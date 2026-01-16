# Configuración de Supabase

## Pasos para configurar Supabase con autenticación de Google

### 1. Crear un proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se complete la configuración (puede tardar unos minutos)

### 2. Obtener las credenciales

1. En el dashboard de Supabase, ve a **Settings** (Configuración)
2. Selecciona **API** en el menú lateral
3. Copia los siguientes valores:
   - **Project URL** (URL del proyecto)
   - **anon public key** (Clave pública anónima) - Esta es la que necesitas para el frontend

**Nota importante sobre las claves:**
- **anon public key**: Es la que usaremos en el frontend Angular. Es segura de exponer porque respeta las políticas RLS (Row Level Security) de Supabase.
- **service_role key**: ⚠️ **NUNCA** debe usarse en el frontend. Solo se usa en backends/APIs con permisos administrativos completos. Si tienes un backend, úsala allí, pero nunca en código que se ejecute en el navegador.

### 3. Configurar las variables de entorno

1. Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y reemplaza los valores con tus credenciales:
   ```env
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_KEY=tu-clave-publica-anon
   PRODUCTION=false
   ```

3. El archivo `environment.ts` se generará automáticamente desde `.env` cuando ejecutes `npm start` o `npm run build`.

   También puedes generarlo manualmente ejecutando:
   ```bash
   npm run env:generate
   ```

**Nota:** El archivo `.env` está excluido del control de versiones por seguridad. Nunca subas tus credenciales reales al repositorio.

### 4. Configurar autenticación con Google

1. En el dashboard de Supabase, ve a **Authentication** > **Providers**
2. Busca **Google** en la lista de proveedores
3. Habilita Google como proveedor
4. Necesitarás configurar:
   - **Client ID** de Google OAuth
   - **Client Secret** de Google OAuth

### 5. Configurar Google OAuth (si aún no lo tienes)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de **Google Identity** (o **Google+ API** si está disponible)
4. Ve a **Credentials** > **Create Credentials** > **OAuth client ID**
5. Configura:
   - **Application type**: Web application
   - **Name**: Senti2 (o el nombre que prefieras)
   - **Authorized redirect URIs**: ⚠️ **MUY IMPORTANTE** - Agrega EXACTAMENTE esta URL:
     ```
     https://igzlyprmxmsijauhivir.supabase.co/auth/v1/callback
     ```
     **Nota:** Esta es la URL de callback de Supabase, NO la URL de tu aplicación Angular. Esta URL debe coincidir exactamente con la que Supabase usa.
6. Copia el **Client ID** y **Client Secret**
7. Ve a Supabase > **Authentication** > **Providers** > **Google**
8. Pega el **Client ID** y **Client Secret** en los campos correspondientes
9. **Habilita** el proveedor Google
10. **Guarda** los cambios

### 6. Configurar URL de redirección en Supabase

1. En Supabase, ve a **Authentication** > **URL Configuration**
2. Configura las siguientes URLs:
   - **Site URL**: `http://localhost:4200` (para desarrollo)
   - **Redirect URLs**: Agrega estas URLs (una por línea):
     ```
     http://localhost:4200
     http://localhost:4200/inicio
     http://localhost:4200/login
     ```
   
   **Importante:** Para producción, agrega también tus URLs de producción:
   ```
   https://tu-dominio.com
   https://tu-dominio.com/inicio
   https://tu-dominio.com/login
   ```

3. **Guarda los cambios** haciendo clic en "Save"

### 7. Verificar la configuración

Una vez configurado, deberías poder:
- Iniciar sesión con email y contraseña
- Iniciar sesión con Google
- Ser redirigido automáticamente después del login

## Notas importantes

- En producción, asegúrate de actualizar las URLs de redirección con tu dominio real
- Mantén tus credenciales seguras y nunca las subas a repositorios públicos
- Considera usar variables de entorno para diferentes ambientes (desarrollo, producción)

