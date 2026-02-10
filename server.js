const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// In-memory data store (replace with DB in production)
const database = {
  users: [],
  ideas: [],
  matches: [],
  pitches: [],
  courses: [],
  conversations: []
};

// Auth Routes
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;
  
  // Check if user exists
  const existingUser = database.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Create new user
  const user = {
    id: Date.now().toString(),
    email,
    name,
    password, // In production, hash this!
    createdAt: new Date().toISOString(),
    profile: {
      skills: [],
      interests: [],
      experience: 0,
      location: '',
      bio: ''
    }
  };
  
  database.users.push(user);
  
  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = database.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

// Idea Routes
app.post('/api/ideas', (req, res) => {
  const { userId, title, problem, description, category, stage } = req.body;
  
  const idea = {
    id: Date.now().toString(),
    userId,
    title,
    problem,
    description,
    category,
    stage: stage || 'idea',
    createdAt: new Date().toISOString(),
    analysis: null
  };
  
  database.ideas.push(idea);
  res.json({ success: true, idea });
});

app.get('/api/ideas', (req, res) => {
  const { userId } = req.query;
  
  const ideas = userId 
    ? database.ideas.filter(i => i.userId === userId)
    : database.ideas;
  
  res.json({ success: true, ideas });
});

app.get('/api/ideas/:id', (req, res) => {
  const idea = database.ideas.find(i => i.id === req.params.id);
  
  if (!idea) {
    return res.status(404).json({ error: 'Idea not found' });
  }
  
  res.json({ success: true, idea });
});

// AI Copilot Routes
app.post('/api/copilot/chat', async (req, res) => {
  const { userId, message, ideaId } = req.body;
  
  // Simulate AI response (replace with actual AI API call)
  const aiResponses = [
    "That's an interesting idea! Have you validated this problem with potential users yet?",
    "Great question. Let's break this down: What's your unfair advantage in this space?",
    "I'd recommend starting with a smaller, specific problem. Who exactly are your first 10 customers?",
    "Have you calculated the TAM (Total Addressable Market) for this solution?",
    "What would make a customer switch from their current solution to yours?"
  ];
  
  const response = {
    id: Date.now().toString(),
    role: 'assistant',
    content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
    timestamp: new Date().toISOString()
  };
  
  // Store conversation
  const conversation = {
    userId,
    ideaId,
    messages: [
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      response
    ]
  };
  
  database.conversations.push(conversation);
  
  res.json({ success: true, response: response.content });
});

// Matching Routes
app.get('/api/matches', (req, res) => {
  const { userId } = req.query;
  
  // Simulate matches (replace with actual matching algorithm)
  const mockMatches = [
    {
      id: '1',
      name: 'Priya Sharma',
      role: 'Technical Co-Founder',
      skills: ['React', 'Node.js', 'AI/ML'],
      matchScore: 0.92,
      location: 'Bangalore',
      bio: 'Full-stack engineer with 5 years experience in B2B SaaS',
      avatar: '👩‍💻'
    },
    {
      id: '2',
      name: 'Rahul Verma',
      role: 'Business Co-Founder',
      skills: ['Marketing', 'Sales', 'Product Strategy'],
      matchScore: 0.87,
      location: 'Mumbai',
      bio: 'Ex-Flipkart PM, passionate about fintech',
      avatar: '👨‍💼'
    },
    {
      id: '3',
      name: 'Ananya Reddy',
      role: 'Design Co-Founder',
      skills: ['UI/UX', 'Branding', 'Design Systems'],
      matchScore: 0.85,
      location: 'Hyderabad',
      bio: 'Product designer with startup experience',
      avatar: '👩‍🎨'
    }
  ];
  
  res.json({ success: true, matches: mockMatches });
});

// Learning Routes
app.get('/api/courses', (req, res) => {
  const courses = [
    {
      id: '1',
      title: 'Idea Validation 101',
      description: 'Learn how to validate your startup idea',
      category: 'validation',
      modules: 12,
      duration: '2 hours',
      difficulty: 'beginner',
      progress: 0
    },
    {
      id: '2',
      title: 'Building Your MVP',
      description: 'From concept to minimum viable product',
      category: 'mvp',
      modules: 15,
      duration: '3 hours',
      difficulty: 'intermediate',
      progress: 0
    },
    {
      id: '3',
      title: 'Fundraising Fundamentals',
      description: 'Master the art of raising capital',
      category: 'fundraising',
      modules: 10,
      duration: '2.5 hours',
      difficulty: 'advanced',
      progress: 0
    }
  ];
  
  res.json({ success: true, courses });
});

// Pitch Routes
app.post('/api/pitches', (req, res) => {
  const { userId, ideaId, videoUrl, description } = req.body;
  
  const pitch = {
    id: Date.now().toString(),
    userId,
    ideaId,
    videoUrl,
    description,
    status: 'pending',
    votes: 0,
    feedback: [],
    createdAt: new Date().toISOString()
  };
  
  database.pitches.push(pitch);
  res.json({ success: true, pitch });
});

app.get('/api/pitches', (req, res) => {
  res.json({ success: true, pitches: database.pitches });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 FoundryAI server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
