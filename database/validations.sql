-- Create Validations Table
CREATE TABLE IF NOT EXISTS idea_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) CHECK (vote_type IN ('tick', 'cross')),
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

-- Enable RLS
ALTER TABLE idea_validations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create validations" ON idea_validations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view validations for their ideas" ON idea_validations
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM ideas WHERE id = idea_validations.idea_id AND user_id = auth.uid())
  );
