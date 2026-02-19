-- Añadir columna role a profiles en Supabase (si usas Supabase para perfiles)
-- Si usas solo Laravel para profiles, ejecuta la migración de Laravel en su lugar.
-- Valores: 'user', 'psicologo', 'admin'

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Para asignar admin a un usuario manualmente:
-- UPDATE profiles SET role = 'admin' WHERE user_id = 'TU_USER_ID_DE_SUPABASE';
