const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Auth Client
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Admin Client (Bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || '', {
    auth: { autoRefreshToken: false, persistSession: false }
});

if (!supabaseServiceKey) {
    console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is missing! RLS will restrict admin operations.');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// =====================================================
// AUTH ROUTES
// =====================================================

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

        if (authError) return res.status(400).json({ success: false, error: authError.message });

        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .insert([{
                id: authData.user.id,
                email,
                name,
                password_hash: await bcrypt.hash(password, 10),
            }])
            .select().single();

        if (userError) return res.status(400).json({ success: false, error: userError.message });

        // Initialize founder status
        await supabaseAdmin.from('founder_status').insert([{
            user_id: authData.user.id,
            current_focus: 'Ideation',
            blockers: 'None',
            suggested_action: 'Submit your first idea',
            stage_progress: 0
        }]);

        res.json({ success: true, user: { id: userData.id, email: userData.email, name: userData.name } });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, error: 'Signup failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

        if (authError) return res.status(401).json({ success: false, error: 'Invalid credentials' });

        // 2. Get user profile
        let { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        // Self-Healing: If user exists in Auth but not in users table, create it
        if (userError && userError.code === 'PGRST116') {
            console.log('Self-healing: Creating missing user profile for', authData.user.email);
            const { data: newProfile, error: createError } = await supabaseAdmin
                .from('users')
                .insert([{
                    id: authData.user.id,
                    email: authData.user.email,
                    name: authData.user.user_metadata?.name || authData.user.email.split('@')[0],
                    password_hash: 'auth_handled' // Passwords managed by Supabase Auth
                }])
                .select().single();

            if (createError) {
                console.error('Self-healing failed:', createError);
                return res.status(500).json({ success: false, error: 'User profile missing and could not be created' });
            }
            userData = newProfile;
            userError = null;
        } else if (userError) {
            return res.status(400).json({ success: false, error: userError.message });
        }

        res.json({ success: true, user: userData, session: authData.session });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// =====================================================
// USER & PROFILE ROUTES
// =====================================================

app.get('/api/users/:id/profile', async (req, res) => {
    try {
        const { data: user, error } = await supabaseAdmin.from('users').select('*').eq('id', req.params.id).single();
        if (error) return res.status(404).json({ success: false, error: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/users/:id/profile', async (req, res) => {
    try {
        const updates = { ...req.body };
        delete updates.id;
        delete updates.email;
        delete updates.password_hash;
        delete updates.created_at;

        const { data, error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', req.params.id)
            .select().single();

        if (error) return res.status(400).json({ success: false, error: error.message });
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
        const { userId, title, description, problem, solution, market, mediaUrl } = req.body;
        const { data, error } = await supabaseAdmin
            .from('ideas')
            .insert([{
                user_id: userId,
                title,
                description,
                problem,
                solution,
                market,
                media_url: mediaUrl,
                stage: 'ideation'
            }])
            .select().single();

        if (error) return res.status(400).json({ success: false, error: error.message });
        res.json({ success: true, idea: data });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create idea' });
    }
});

app.get('/api/ideas', async (req, res) => {
    try {
        const { userId } = req.query;
        let query = supabaseAdmin.from('ideas').select('*, idea_validations(*)').order('created_at', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await query;
        if (error) return res.status(400).json({ success: false, error: error.message });
        res.json({ success: true, ideas: data });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch ideas' });
    }
});

app.get('/api/ideas/feed', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

        const { data: validations } = await supabaseAdmin.from('idea_validations').select('idea_id').eq('user_id', userId);
        const validatedIdeaIds = validations ? validations.map(v => v.idea_id) : [];

        let query = supabaseAdmin.from('ideas').select('*, users(name, stage)').neq('user_id', userId).order('created_at', { ascending: false }).limit(20);
        if (validatedIdeaIds.length > 0) query = query.not('id', 'in', `(${validatedIdeaIds.join(',')})`);

        const { data: ideas, error } = await query;
        if (error) return res.status(400).json({ success: false, error: error.message });
        res.json({ success: true, ideas });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/ideas/:id/validate', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, voteType, feedback } = req.body;

        const { error: insertError } = await supabaseAdmin
            .from('idea_validations')
            .insert({ idea_id: id, user_id: userId, vote_type: voteType, feedback });

        if (insertError) {
            if (insertError.code === '23505') return res.json({ success: false, error: 'Already validated' });
            throw insertError;
        }

        const { data: allVotes } = await supabaseAdmin.from('idea_validations').select('vote_type').eq('idea_id', id);
        if (allVotes) {
            const score = Math.round((allVotes.filter(v => v.vote_type === 'tick').length / allVotes.length) * 100);
            await supabaseAdmin.from('ideas').update({ validation_score: score }).eq('id', id);
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// CO-FOUNDER MATCHING ROUTES
// =====================================================

function calculateMatchScore(u1, u2) {
    let s = 0;
    if (u1.looking_for && u2.primary_skill && u1.looking_for.toLowerCase().includes(u2.primary_skill.toLowerCase())) s += 20;
    if (u1.industry_interests && u2.industry_interests) s += Math.min(u1.industry_interests.filter(i => u2.industry_interests.includes(i)).length * 5, 15);
    if (u1.can_commit_20hrs_week === u2.can_commit_20hrs_week) s += 10;
    if (u1.can_go_fulltime === u2.can_go_fulltime) s += 10;
    if (u1.city === u2.city) s += 10;
    if (u1.remote_preference === u2.remote_preference) s += 5;
    if (u1.stage === u2.stage) s += 10;
    return Math.min(s + 30, 98); // Base score + jitter logic simplified
}

app.get('/api/matches', async (req, res) => {
    try {
        const { userId } = req.query;
        const { data: currentUser } = await supabaseAdmin.from('users').select('*').eq('id', userId).single();
        if (!currentUser) return res.status(404).json({ success: false, error: 'User not found' });

        const { data: candidates } = await supabaseAdmin.from('users').select('*').neq('id', userId).limit(50);
        const { data: connections } = await supabaseAdmin.from('cofounder_matches').select('matched_user_id, status').eq('user_id', userId);
        const connMap = {};
        if (connections) connections.forEach(c => connMap[c.matched_user_id] = c.status);

        const matches = candidates.map(u => ({
            ...u,
            match_score: calculateMatchScore(currentUser, u),
            connection_status: connMap[u.id] || null
        })).sort((a, b) => b.match_score - a.match_score);

        res.json({ success: true, matches });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/matches', async (req, res) => {
    try {
        const { userId, matchedUserId } = req.body;
        const { data, error } = await supabaseAdmin
            .from('cofounder_matches')
            .insert([{ user_id: userId, matched_user_id: matchedUserId, status: 'pending' }])
            .select().single();
        if (error) return res.status(400).json({ success: false, error: error.message });
        res.json({ success: true, match: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/matches/requests', async (req, res) => {
    try {
        const { userId } = req.query;
        const { data: incoming } = await supabaseAdmin.from('cofounder_matches').select('id, status, sender:users!user_id(*)').eq('matched_user_id', userId).eq('status', 'pending');
        const { data: outgoing } = await supabaseAdmin.from('cofounder_matches').select('id, status, receiver:users!matched_user_id(*)').eq('user_id', userId);
        res.json({ success: true, requests: incoming || [], sent: outgoing || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/matches/:id/respond', async (req, res) => {
    try {
        const { status } = req.body;
        const { error } = await supabaseAdmin.from('cofounder_matches').update({ status }).eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// MESSAGING ROUTES
// =====================================================

app.get('/api/connections', async (req, res) => {
    try {
        const { userId } = req.query;
        const { data: asSender } = await supabaseAdmin.from('cofounder_matches').select(`id, status, partner:users!matched_user_id(id, name, role)`).eq('user_id', userId).eq('status', 'accepted');
        const { data: asReceiver } = await supabaseAdmin.from('cofounder_matches').select(`id, status, partner:users!user_id(id, name, role)`).eq('matched_user_id', userId).eq('status', 'accepted');
        const all = [...(asSender || []), ...(asReceiver || [])];
        res.json({ success: true, connections: all });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        const { connectionId } = req.query;
        const { data, error } = await supabaseAdmin.from('messages').select('*').eq('connection_id', connectionId).order('created_at', { ascending: true });
        if (error) throw error;
        res.json({ success: true, messages: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const { connectionId, senderId, content } = req.body;
        const { data, error } = await supabaseAdmin.from('messages').insert([{ sender_id: senderId, content, connection_id: connectionId }]).select().single();
        if (error) throw error;
        res.json({ success: true, message: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// RESOURCES & GAMIFICATION
// =====================================================

app.get('/api/resources', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.from('resources').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ success: true, resources: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/resources/:id/complete', async (req, res) => {
    try {
        const { userId, duration } = req.body;
        const points = (parseInt(duration) || 5) * 10;
        await supabaseAdmin.from('user_resources').insert([{ user_id: userId, resource_id: req.params.id }]);
        const { data: user } = await supabaseAdmin.from('users').select('points').eq('id', userId).single();
        const newPoints = (user?.points || 0) + points;
        await supabaseAdmin.from('users').update({ points: newPoints }).eq('id', userId);
        res.json({ success: true, points: newPoints, awarded: points });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// =====================================================
// SPA & SERVER START
// =====================================================

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
