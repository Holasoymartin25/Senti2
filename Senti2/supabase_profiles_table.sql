-- Crear tabla de perfiles de usuario en Supabase
-- Ejecuta este SQL en el SQL Editor de Supabase

-- Crear la tabla profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  apellidos TEXT,
  telefono TEXT,
  fecha_nacimiento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Crear índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar su propio perfil
CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

