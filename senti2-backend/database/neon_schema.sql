-- Senti2 — esquema PostgreSQL para Neon
-- Ejecutar en: Neon Console → SQL Editor
-- AVISO: el bloque inicial borra tablas existentes (solo en BBDD vacía o de desarrollo).
-- Preferible: `php artisan migrate --force` (no mezclar con este SQL y migrate en la misma BBDD).

BEGIN;

-- ── Limpieza (opcional; quita este bloque si ya tienes datos que conservar) ──
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patient_requests CASCADE;
DROP TABLE IF EXISTS diary_entries CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS personal_access_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS failed_jobs CASCADE;
DROP TABLE IF EXISTS job_batches CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS cache_locks CASCADE;
DROP TABLE IF EXISTS cache CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS migrations CASCADE;

-- ── users ───────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP(0) WITHOUT TIME ZONE,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100),
    role VARCHAR(255) NOT NULL DEFAULT 'user',
    psicologo_id BIGINT,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT users_psicologo_id_foreign
        FOREIGN KEY (psicologo_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX users_psicologo_id_index ON users (psicologo_id);

-- ── auth / sessions ─────────────────────────────────────────────────────────
CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE
);

CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

CREATE INDEX sessions_user_id_index ON sessions (user_id);
CREATE INDEX sessions_last_activity_index ON sessions (last_activity);

-- ── profiles ────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    nombre VARCHAR(255),
    apellidos VARCHAR(255),
    telefono VARCHAR(255),
    fecha_nacimiento DATE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT profiles_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Sanctum tokens ────────────────────────────────────────────────────────────
CREATE TABLE personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT,
    last_used_at TIMESTAMP(0) WITHOUT TIME ZONE,
    expires_at TIMESTAMP(0) WITHOUT TIME ZONE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE
);

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index
    ON personal_access_tokens (tokenable_type, tokenable_id);
CREATE INDEX personal_access_tokens_expires_at_index ON personal_access_tokens (expires_at);

-- ── área personal ─────────────────────────────────────────────────────────────
CREATE TABLE test_results (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    test_id VARCHAR(64) NOT NULL,
    test_title VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    display_score INTEGER NOT NULL,
    display_max INTEGER NOT NULL,
    level VARCHAR(64) NOT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT test_results_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE diary_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date DATE NOT NULL,
    mood SMALLINT NOT NULL CHECK (mood >= 0 AND mood <= 255),
    emotions JSONB,
    note TEXT,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT diary_entries_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── psicólogo / paciente ──────────────────────────────────────────────────────
CREATE TABLE patient_requests (
    id BIGSERIAL PRIMARY KEY,
    psicologo_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT patient_requests_psicologo_id_foreign
        FOREIGN KEY (psicologo_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT patient_requests_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT patient_requests_psicologo_id_user_id_unique
        UNIQUE (psicologo_id, user_id)
);

CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    psicologo_id BIGINT NOT NULL,
    paciente_id BIGINT NOT NULL,
    fecha_hora TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    duracion SMALLINT NOT NULL DEFAULT 60,
    modalidad VARCHAR(255) NOT NULL DEFAULT 'presencial'
        CHECK (modalidad IN ('presencial', 'online')),
    estado VARCHAR(255) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
    notas TEXT,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT appointments_psicologo_id_foreign
        FOREIGN KEY (psicologo_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT appointments_paciente_id_foreign
        FOREIGN KEY (paciente_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── mensajería ────────────────────────────────────────────────────────────────
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT messages_sender_id_foreign
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT messages_receiver_id_foreign
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── cache / colas (Laravel) ───────────────────────────────────────────────────
CREATE TABLE cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expiration INTEGER NOT NULL
);

CREATE INDEX cache_expiration_index ON cache (expiration);

CREATE TABLE cache_locks (
    key VARCHAR(255) PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INTEGER NOT NULL
);

CREATE INDEX cache_locks_expiration_index ON cache_locks (expiration);

CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    attempts SMALLINT NOT NULL,
    reserved_at INTEGER,
    available_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX jobs_queue_index ON jobs (queue);

CREATE TABLE job_batches (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_jobs INTEGER NOT NULL,
    pending_jobs INTEGER NOT NULL,
    failed_jobs INTEGER NOT NULL,
    failed_job_ids TEXT NOT NULL,
    options TEXT,
    cancelled_at INTEGER,
    created_at INTEGER NOT NULL,
    finished_at INTEGER
);

CREATE TABLE failed_jobs (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload TEXT NOT NULL,
    exception TEXT NOT NULL,
    failed_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── tabla migrations (para que Laravel no vuelva a crear lo mismo) ───────────
CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    migration VARCHAR(255) NOT NULL,
    batch INTEGER NOT NULL
);

INSERT INTO migrations (migration, batch) VALUES
    ('0001_01_01_000000_create_users_table', 1),
    ('0001_01_01_000001_create_cache_table', 1),
    ('0001_01_01_000002_create_jobs_table', 1),
    ('2026_01_23_113159_create_profiles_table', 1),
    ('2026_05_06_175107_create_personal_access_tokens_table', 1),
    ('2026_05_06_200000_create_test_results_table', 1),
    ('2026_05_06_200001_create_diary_entries_table', 1),
    ('2026_05_07_000000_add_role_to_users_table', 1),
    ('2026_05_11_000000_add_psicologo_id_to_users_table', 1),
    ('2026_05_11_100000_create_patient_requests_table', 1),
    ('2026_05_18_000000_create_appointments_table', 1),
    ('2026_05_21_171004_create_messages_table', 1);

COMMIT;

-- Datos de prueba: mejor con Laravel (contraseñas hasheadas):
--   cd senti2-backend
--   php artisan db:seed --force
--
-- Login admin: admin@senti2.com / password
