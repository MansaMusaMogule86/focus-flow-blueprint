-- Vitality Antigravity - PostgreSQL Schema with Row-Level Security
-- Production-grade database schema for AI Operating System
-- Generated: 2026-01-24

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: users
-- Core user authentication and profile data
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast email lookup during login
CREATE INDEX idx_users_email ON users(email);

-- RLS Policy: Users can only access their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_isolation_policy ON users
    FOR ALL
    USING (id = current_setting('app.current_user_id')::UUID);

-- ============================================================================
-- TABLE: executions
-- AI module execution history and results
-- ============================================================================
CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id VARCHAR(100) NOT NULL,
    input TEXT NOT NULL,
    output TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    error TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_executions_user_id ON executions(user_id);
CREATE INDEX idx_executions_module_id ON executions(module_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_created_at ON executions(created_at DESC);

-- RLS Policy: Users can only see their own execution history
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY executions_isolation_policy ON executions
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- ============================================================================
-- TABLE: memory
-- Persistent context/memory for AI modules per user
-- ============================================================================
CREATE TABLE memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id VARCHAR(100) NOT NULL,
    context TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one memory record per user per module
    UNIQUE(user_id, module_id)
);

-- Indexes
CREATE INDEX idx_memory_user_id ON memory(user_id);
CREATE INDEX idx_memory_module_id ON memory(module_id);

-- RLS Policy: Users can only access their own module memory
ALTER TABLE memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY memory_isolation_policy ON memory
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- ============================================================================
-- TABLE: agents
-- Custom AI agents built by users
-- ============================================================================
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    system_prompt TEXT NOT NULL,
    model VARCHAR(100) NOT NULL DEFAULT 'gemini-2.0-flash-exp',
    tools JSONB DEFAULT '[]'::JSONB,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_created_at ON agents(created_at DESC);

-- RLS Policy: Users can only manage their own agents
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY agents_isolation_policy ON agents
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- ============================================================================
-- TABLE: path_progress
-- PATH system step completion tracking
-- ============================================================================
CREATE TABLE path_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'locked',
    completed_at TIMESTAMP WITH TIME ZONE,
    vault_item_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one progress record per user per step
    UNIQUE(user_id, step_id)
);

-- Indexes
CREATE INDEX idx_path_progress_user_id ON path_progress(user_id);
CREATE INDEX idx_path_progress_status ON path_progress(status);

-- RLS Policy
ALTER TABLE path_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY path_progress_isolation_policy ON path_progress
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- ============================================================================
-- TABLE: vault_items
-- User's saved AI-generated content
-- ============================================================================
CREATE TABLE vault_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    module_id VARCHAR(100) NOT NULL,
    module_name VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vault_items_user_id ON vault_items(user_id);
CREATE INDEX idx_vault_items_type ON vault_items(type);
CREATE INDEX idx_vault_items_module_id ON vault_items(module_id);
CREATE INDEX idx_vault_items_created_at ON vault_items(created_at DESC);
CREATE INDEX idx_vault_items_tags ON vault_items USING GIN(tags);

-- Full-text search on title and content
CREATE INDEX idx_vault_items_search ON vault_items USING GIN(to_tsvector('english', title || ' ' || content));

-- RLS Policy
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY vault_items_isolation_policy ON vault_items
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- ============================================================================
-- TABLE: onboarding_status
-- Track user onboarding completion
-- ============================================================================
CREATE TABLE onboarding_status (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    current_step INTEGER DEFAULT 1,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY onboarding_status_isolation_policy ON onboarding_status
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- ============================================================================
-- FUNCTIONS: Updated_at trigger
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memory_updated_at BEFORE UPDATE ON memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_path_progress_updated_at BEFORE UPDATE ON path_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_items_updated_at BEFORE UPDATE ON vault_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_status_updated_at BEFORE UPDATE ON onboarding_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE users IS 'Core user authentication and profile data';
COMMENT ON TABLE executions IS 'AI module execution history and results';
COMMENT ON TABLE memory IS 'Persistent context/memory for AI modules per user';
COMMENT ON TABLE agents IS 'Custom AI agents built by users';
COMMENT ON TABLE path_progress IS 'PATH system 8-step progression tracking';
COMMENT ON TABLE vault_items IS 'User-saved AI-generated content across all modules';
COMMENT ON TABLE onboarding_status IS 'User onboarding flow completion tracking';
