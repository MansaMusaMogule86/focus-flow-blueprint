-- Vitality Antigravity - Seed Data for Development
-- Creates a test user and sample data for local development

-- Test user (password: 'password123')
-- Password hash is bcrypt hash of 'password123'
INSERT INTO users (id, email, password_hash, name, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@vitality.ai',
    '$2a$10$rZ5Kj8jN5y3v.IVm8nT9U.vKz3yZ4L9xT5qN7wX8hZ6vB4nW1qY2K',
    'Demo User',
    'user'
)
ON CONFLICT (email) DO NOTHING;

-- Initialize onboarding status for demo user
INSERT INTO onboarding_status (user_id, completed, current_step)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    true,
    8
)
ON CONFLICT (user_id) DO NOTHING;

-- Initialize PATH progress - unlock first step
INSERT INTO path_progress (user_id, step_id, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'step-1',
    'unlocked'
)
ON CONFLICT (user_id, step_id) DO NOTHING;
