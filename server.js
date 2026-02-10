const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Client (Auth operations)
const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Admin Client (Database operations - Always uses Service Role to bypass RLS)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is missing! Using ANON key (RLS will enforce rules).');
} else {
    console.log('✅ Service Role Key Loaded (Bypassing RLS)');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// =====================================================
// AUTH ROUTES
// =====================================================

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            return res.status(400).json({ success: false, error: authError.message });
        }

        // Create user profile in users table (Use Admin Client!)
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    email,
                    name,
                    password_hash: await bcrypt.hash(password, 10),
                }
            ])
            .select()
            .single();

        if (userError) {
            return res.status(400).json({ success: false, error: userError.message });
        }

        // Initialize founder status
        await supabaseAdmin
            .from('founder_status')
            .insert([
                {
                    user_id: authData.user.id,
                    current_focus: 'Ideation',
                    blockers: 'None',
                    suggested_action: 'Submit your first idea',
                    stage_progress: 0
                }
            ]);

        res.json({
            success: true,
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, error: 'Signup failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Get user profile
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, email, name, role, stage, location')
            .eq('id', authData.user.id)
            .single();

        if (userError) {
            return res.status(400).json({ success: false, error: userError.message });
        }

        res.json({
            success: true,
            user: userData,
            session: authData.session,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// Update user profile
app.put('/api/users/:userId/profile', async (req, res) => {
    try {
        const { userId } = req.params;
        const { stage, bio, skills, location } = req.body;

        const { data, error } = await supabaseAdmin
            .from('users')
            .update({
                stage,
                bio,
                skills,
                location,
            })
            .eq('id', userId)
            .select('id, email, name, role, stage, bio, skills, location')
            .single();

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        res.json({ success: true, user: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// IDEAS ROUTES
// =====================================================

app.post('/api/ideas', async (req, res) => {
    try {
        const { userId, title, description, problem, solution, market } = req.body;

        const { data, error } = await supabaseAdmin
            .from('ideas')
            .insert([
                {
                    user_id: userId,
                    title,
                    description,
                    solution,
                    market,
                    media_url: req.body.mediaUrl, // Store video/PPT link
                    stage: 'ideation',
                    validation_score: 0,
                }
            ])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        res.json({ success: true, idea: data });
    } catch (error) {
        console.error('Create idea error:', error);
        res.status(500).json({ success: false, error: 'Failed to create idea' });
    }
});

app.get('/api/ideas', async (req, res) => {
    try {
        const { userId } = req.query;

        let query = supabaseAdmin
            .from('ideas')
            .select('*, idea_validations(*)') // Fetch feedback with ideas
            .order('created_at', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        res.json({ success: true, ideas: data });
    } catch (error) {
        console.error('Get ideas error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch ideas' });
    }
});

// Validation Feed Route (Must be before :id)
app.get('/api/ideas/feed', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        // 1. Get list of ideas the user has already validated
        const { data: validations, error: validationError } = await supabaseAdmin
            .from('idea_validations')
            .select('idea_id')
            .eq('user_id', userId);

        if (validationError && validationError.code !== '42P01') { // Ignore "relation does not exist" if table missing
            console.error('Error fetching validations:', validationError);
            // Continue if table doesn't exist, treat as empty
        }

        const validatedIdeaIds = validations ? validations.map(v => v.idea_id) : [];

        // 2. Fetch ideas NOT created by user AND NOT validated by user
        let query = supabaseAdmin
            .from('ideas')
            .select('*, users(name, stage)')
            .neq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (validatedIdeaIds.length > 0) {
            query = query.not('id', 'in', `(${validatedIdeaIds.join(',')})`);
        }

        const { data: ideas, error: ideasError } = await query;

        if (ideasError) {
            return res.status(400).json({ success: false, error: ideasError.message });
        }

        res.json({ success: true, ideas });

    } catch (error) {
        console.error('Feed error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/ideas/:id', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('ideas')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) {
            return res.status(404).json({ success: false, error: 'Idea not found' });
        }

        res.json({ success: true, idea: data });
    } catch (error) {
        console.error('Get idea error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch idea' });
    }
});

// =====================================================
// FOUNDER STATUS ROUTES
// =====================================================

app.get('/api/founder-status/:userId', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('founder_status')
            .select('*')
            .eq('user_id', req.params.userId)
            .single();

        if (error && error.code !== 'PGRST116') { // Not found error
            return res.status(400).json({ success: false, error: error.message });
        }

        // If no status exists, create one
        if (!data) {
            const { data: newData, error: createError } = await supabaseAdmin
                .from('founder_status')
                .insert([
                    {
                        user_id: req.params.userId,
                        current_focus: 'Validation',
                        blockers: 'Co-founder, MVP scope',
                        suggested_action: 'Activate co-founder matching',
                        stage_progress: 0
                    }
                ])
                .select()
                .single();

            if (createError) {
                return res.status(400).json({ success: false, error: createError.message });
            }

            return res.json({ success: true, status: newData });
        }

        res.json({ success: true, status: data });
    } catch (error) {
        console.error('Get founder status error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch status' });
    }
});

app.put('/api/founder-status/:userId', async (req, res) => {
    try {
        const { current_focus, blockers, suggested_action, stage_progress } = req.body;

        const { data, error } = await supabaseAdmin
            .from('founder_status')
            .update({
                current_focus,
                blockers,
                suggested_action,
                stage_progress,
            })
            .eq('user_id', req.params.userId)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        res.json({ success: true, status: data });
    } catch (error) {
        console.error('Update founder status error:', error);
        res.status(500).json({ success: false, error: 'Failed to update status' });
    }
});

// =====================================================
// CO-FOUNDER MATCHING ROUTES
// =====================================================

app.get('/api/matches', async (req, res) => {
    try {
        const { userId } = req.query;

        // 1. Get potential co-founders (exclude self)
        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, name, role, stage, skills, location, bio')
            .neq('id', userId)
            .limit(10);

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        // 2. Get existing connection statuses for these users
        const { data: connections } = await supabaseAdmin
            .from('cofounder_matches')
            .select('matched_user_id, status')
            .eq('user_id', userId)
            .in('matched_user_id', users.map(u => u.id));

        const sentRequestMap = {};
        if (connections) {
            connections.forEach(c => { sentRequestMap[c.matched_user_id] = c.status; });
        }

        // Fetch current user skills for matching
        const { data: currentUser } = await supabaseAdmin.from('users').select('skills, role').eq('id', userId).single();
        const mySkills = currentUser?.skills || [];
        const myRole = currentUser?.role || '';

        const matches = users.map((user) => {
            // Real Match Logic
            const otherSkills = user.skills || [];
            const commonSkills = otherSkills.filter(s => mySkills.includes(s));
            let score = 60; // Base score

            // Skill overlap bonus
            if (commonSkills.length > 0) score += (commonSkills.length * 5);

            // Role Synergy (e.g. Tech + Biz = Good)
            const isTech = r => /dev|eng|tech|cto/i.test(r);
            const isBiz = r => /business|marketing|sales|ceo/i.test(r);
            if ((isTech(myRole) && isBiz(user.role)) || (isBiz(myRole) && isTech(user.role))) {
                score += 15;
            }

            // Cap at 98
            score = Math.min(98, score);
            // Floor at 40
            score = Math.max(40, score);

            return {
                ...user,
                match_score: score,
                connection_status: sentRequestMap[user.id] || null
            };
        }).sort((a, b) => b.match_score - a.match_score);

        res.json({ success: true, matches });
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch matches' });
    }
});

app.get('/api/matches/requests', async (req, res) => {
    try {
        const { userId } = req.query;

        // Fetch Incoming (Received)
        const { data: incoming, error: inError } = await supabaseAdmin
            .from('cofounder_matches')
            .select(`
                id,
                status,
                sender:users!user_id (id, name, stage, role, skills, location)
            `)
            .eq('matched_user_id', userId)
            .eq('status', 'pending');

        if (inError) throw inError;

        // Fetch Outgoing (Sent)
        const { data: outgoing, error: outError } = await supabaseAdmin
            .from('cofounder_matches')
            .select(`
                id,
                status,
                receiver:users!matched_user_id (id, name, stage, role, skills, location)
            `)
            .eq('user_id', userId)
            .eq('status', 'pending');

        if (outError) throw outError;

        res.json({ success: true, requests: incoming, sent: outgoing });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch requests' });
    }
});

app.get('/api/connections', async (req, res) => {
    try {
        const { userId } = req.query;

        // We use explicit embedding to avoid ambiguity
        // If users!matched_user_id doesn't work, we might need to rely on the fact that we've set up correct FKs

        const { data: asSender, error: err1 } = await supabaseAdmin
            .from('cofounder_matches')
            .select(`id, status, partner:users!matched_user_id(id, name, role)`)
            .eq('user_id', userId)
            .eq('status', 'accepted');

        const { data: asReceiver, error: err2 } = await supabaseAdmin
            .from('cofounder_matches')
            .select(`id, status, partner:users!user_id(id, name, role)`)
            .eq('matched_user_id', userId)
            .eq('status', 'accepted');

        if (err1) console.error('Error fetching connections (sender):', err1);
        if (err2) console.error('Error fetching connections (receiver):', err2);

        if (err1 || err2) throw err1 || err2;

        const allConnections = [...(asSender || []), ...(asReceiver || [])];

        // Deduplicate by partner ID
        const uniqueConnections = [];
        const seenIds = new Set();

        allConnections.forEach(c => {
            // Check if partner exists (sometimes join fails if user deleted)
            if (c.partner && !seenIds.has(c.partner.id)) {
                seenIds.add(c.partner.id);
                // Standardize partner object for frontend
                uniqueConnections.push({
                    id: c.id, // match id
                    status: c.status,
                    partner: c.partner
                });
            }
        });

        res.json({ success: true, connections: uniqueConnections });
    } catch (error) {
        console.error('Get connections error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch connections' });
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        const { connectionId } = req.query;
        const { data, error } = await supabaseAdmin
            .from('messages')
            .select('*')
            .eq('connection_id', connectionId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ success: true, messages: data });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const { connectionId, senderId, content } = req.body;
        const { data, error } = await supabaseAdmin
            .from('messages')
            .insert([{ sender_id: senderId, content, connection_id: connectionId }])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, message: data });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

app.post('/api/matches/:id/respond', async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        const { error } = await supabaseAdmin
            .from('cofounder_matches')
            .update({ status })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Respond match error:', error);
        res.status(500).json({ success: false, error: 'Failed to respond' });
    }
});

// Original Create Match Route (unchanged but context)
app.post('/api/matches', async (req, res) => {
    try {
        const { userId, matchedUserId } = req.body;

        const { data, error } = await supabaseAdmin
            .from('cofounder_matches')
            .insert([
                {
                    user_id: userId,
                    matched_user_id: matchedUserId,
                    match_score: 85, // Default score
                    status: 'pending',
                }
            ])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') return res.json({ success: false, error: 'Request already sent!' }); // Unique constraint
            throw error;
        }

        res.json({ success: true, match: data });
    } catch (error) {
        console.error('Create match error:', error);
        res.status(500).json({ success: false, error: 'Failed to create match' });
    }
});

// =====================================================
// RESOURCES ROUTES
// =====================================================

app.get('/api/resources', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('resources')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        res.json({ success: true, resources: data });
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch resources' });
    }
});

// =====================================================
// AI COPILOT ROUTES
// =====================================================

app.post('/api/copilot/chat', async (req, res) => {
    try {
        const { userId, ideaId, message } = req.body;

        // Simulate AI response (replace with actual AI API)
        const aiResponses = [
            "That's an interesting idea! Have you validated this problem with potential users yet?",
            "Great question. Let's break this down: What's your unfair advantage in this space?",
            "I'd recommend starting with a smaller, specific problem. Who exactly are your first 10 customers?",
            "Have you calculated the TAM (Total Addressable Market) for this solution?",
            "What would make a customer switch from their current solution to yours?",
        ];

        const aiResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

        // Store conversation
        const messages = [
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() },
        ];

        const { data, error } = await supabaseAdmin
            .from('copilot_conversations')
            .insert([
                {
                    user_id: userId,
                    idea_id: ideaId,
                    messages,
                }
            ])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ success: false, error: error.message });
        }

        res.json({ success: true, response: aiResponse });
    } catch (error) {
        console.error('Copilot chat error:', error);
        res.status(500).json({ success: false, error: 'Failed to get AI response' });
    }
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        supabase: !!process.env.SUPABASE_URL,
    });
});

// =====================================================
// SERVE INDEX.HTML FOR SPA
// =====================================================

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =====================================================
// VALIDATION FEED ROUTES
// =====================================================

// Get ideas feed for validation (exclude own ideas and already validated ones)
app.get('/api/ideas/feed', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const { data: validations, error: validationError } = await supabaseAdmin
            .from('idea_validations')
            .select('idea_id')
            .eq('user_id', userId);

        if (validationError && validationError.code !== '42P01') { // Ignore "relation does not exist" if table missing
            console.error('Error fetching validations:', validationError);
            // Continue if table doesn't exist, treat as empty
        }

        const validatedIdeaIds = validations ? validations.map(v => v.idea_id) : [];

        // 2. Fetch ideas NOT created by user AND NOT validated by user
        let query = supabaseAdmin
            .from('ideas')
            .select('*, users(name, stage)')
            .neq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (validatedIdeaIds.length > 0) {
            query = query.not('id', 'in', `(${validatedIdeaIds.join(',')})`);
        }

        const { data: ideas, error: ideasError } = await query;

        if (ideasError) {
            return res.status(400).json({ success: false, error: ideasError.message });
        }

        res.json({ success: true, ideas });

    } catch (error) {
        console.error('Feed error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit Validation (Tick/Cross)
app.post('/api/ideas/:id/validate', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, voteType, feedback } = req.body; // voteType: 'tick' or 'cross'

        if (!['tick', 'cross'].includes(voteType)) {
            return res.status(400).json({ success: false, error: 'Invalid vote type' });
        }
        if (!feedback || feedback.trim().length < 5) {
            return res.status(400).json({ success: false, error: 'Feedback is required (min 5 chars)' });
        }

        // 1. Record validation
        const { error: insertError } = await supabaseAdmin
            .from('idea_validations')
            .insert({
                idea_id: id,
                user_id: userId,
                vote_type: voteType,
                feedback
            });

        if (insertError) {
            // Check for duplicate vote
            if (insertError.code === '23505') { // Unique violation
                return res.json({ success: false, error: 'You have already validated this idea' });
            }
            throw insertError;
        }

        // 2. Update Idea Validation Score
        // Fetch current votes
        const { data: allVotes } = await supabaseAdmin
            .from('idea_validations')
            .select('vote_type')
            .eq('idea_id', id);

        if (allVotes) {
            const total = allVotes.length;
            const ticks = allVotes.filter(v => v.vote_type === 'tick').length;
            const score = Math.round((ticks / total) * 100);

            await supabaseAdmin
                .from('ideas')
                .update({ validation_score: score })
                .eq('id', id);
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// START SERVER
// =====================================================

// Only start server if run directly (not imported as Vercel function)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 FoundryAI server running on http://localhost:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🗄️  Database: ${process.env.SUPABASE_URL ? 'Supabase Connected' : 'No Supabase configured'}`);
    });
}

module.exports = app;
