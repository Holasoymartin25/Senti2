-- Tablas para Área Personal: resultados de tests emocionales y entradas del diario.
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase.
-- Requiere que auth.users exista (Supabase Auth).
--
-- El backend Laravel usa la API REST de Supabase con la clave service_role (SUPABASE_KEY)
-- para insertar y leer por user_id. Asegúrate de que .env tenga SUPABASE_KEY=service_role.

-- ========== test_results ==========
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  test_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  display_score INTEGER NOT NULL,
  display_max INTEGER NOT NULL,
  level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS test_results_user_id_idx ON test_results(user_id);
CREATE INDEX IF NOT EXISTS test_results_created_at_idx ON test_results(created_at DESC);

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own test_results"
  ON test_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test_results"
  ON test_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Opcional: permitir borrar sus propios registros
CREATE POLICY "Users can delete own test_results"
  ON test_results FOR DELETE
  USING (auth.uid() = user_id);

-- ========== diary_entries ==========
CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 10),
  emotions TEXT[] DEFAULT '{}',
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS diary_entries_user_id_idx ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS diary_entries_user_date_idx ON diary_entries(user_id, date DESC);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diary_entries"
  ON diary_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary_entries"
  ON diary_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary_entries"
  ON diary_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary_entries"
  ON diary_entries FOR DELETE
  USING (auth.uid() = user_id);
