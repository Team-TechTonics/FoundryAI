-- =====================================================
-- FOUNDRY AI - SUPABASE DATABASE SCHEMA
-- Entrepreneurship OS Database
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'founder',
  stage VARCHAR(50) DEFAULT 'ideation',
  bio TEXT,
  skills TEXT[], -- Array of skills
  location VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- IDEAS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  problem TEXT,
  solution TEXT,
  market VARCHAR(100),
  stage VARCHAR(50) DEFAULT 'ideation',
  validation_score INTEGER DEFAULT 0,
  market_size VARCHAR(50),
  competition VARCHAR(50),
  target_audience TEXT,
  unique_value_proposition TEXT,
  revenue_model TEXT,
  ai_analysis JSONB, -- Store AI validation results
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CO-FOUNDER MATCHES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cofounder_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  matched_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AI COPILOT CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS copilot_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]', -- Array of {role, content, timestamp}
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FOUNDER STATUS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS founder_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_focus VARCHAR(255),
  blockers TEXT,
  suggested_action VARCHAR(255),
  stage_progress INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RESOURCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- course, template, guide, article
  url TEXT,
  tags TEXT[],
  difficulty VARCHAR(50), -- beginner, intermediate, advanced
  duration VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_stage ON ideas(stage);
CREATE INDEX IF NOT EXISTS idx_ideas_market ON ideas(market);
CREATE INDEX IF NOT EXISTS idx_cofounder_matches_user_id ON cofounder_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_cofounder_matches_matched_user_id ON cofounder_matches(matched_user_id);
CREATE INDEX IF NOT EXISTS idx_copilot_conversations_user_id ON copilot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_copilot_conversations_idea_id ON copilot_conversations(idea_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cofounder_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_status ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Ideas policies
CREATE POLICY "Users can view own ideas" ON ideas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas" ON ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Co-founder matches policies
CREATE POLICY "Users can view own matches" ON cofounder_matches
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can create matches" ON cofounder_matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own matches" ON cofounder_matches
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

-- Copilot conversations policies
CREATE POLICY "Users can view own conversations" ON copilot_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON copilot_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON copilot_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Founder status policies
CREATE POLICY "Users can view own status" ON founder_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own status" ON founder_status
  FOR ALL USING (auth.uid() = user_id);

-- Resources are public
CREATE POLICY "Resources are viewable by everyone" ON resources
  FOR SELECT USING (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cofounder_matches_updated_at BEFORE UPDATE ON cofounder_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_copilot_conversations_updated_at BEFORE UPDATE ON copilot_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_founder_status_updated_at BEFORE UPDATE ON founder_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample resources
INSERT INTO resources (title, description, type, url, tags, difficulty, duration) VALUES
  ('How to Validate Your Startup Idea', 'Complete guide to validating startup ideas in the Indian market', 'guide', 'https://example.com/guide', ARRAY['validation', 'india', 'startup'], 'beginner', '30 min'),
  ('Co-Founder Matching Best Practices', 'Learn how to find and evaluate potential co-founders', 'article', 'https://example.com/article', ARRAY['co-founder', 'team'], 'intermediate', '15 min'),
  ('MVP Development Roadmap', 'Step-by-step guide to building your first MVP', 'course', 'https://example.com/course', ARRAY['mvp', 'development'], 'intermediate', '4 hours');
