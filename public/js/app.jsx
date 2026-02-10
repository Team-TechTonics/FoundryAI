const { useState, useEffect, createContext, useContext } = React;

// ========================
// CONTEXT & STATE MANAGEMENT
// ========================

const AppContext = createContext();

const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};

// API Helper
const API_URL = 'http://localhost:3000/api';

const api = {
    async post(endpoint, data) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    async get(endpoint) {
        const response = await fetch(`${API_URL}${endpoint}`);
        return response.json();
    },
};

// ========================
// APP PROVIDER
// ========================

function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('landing');
    const [ideas, setIdeas] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setCurrentPage('dashboard');
        }
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const result = await api.post('/auth/login', { email, password });
            if (result.success) {
                setUser(result.user);
                localStorage.setItem('user', JSON.stringify(result.user));
                setCurrentPage('dashboard');
                return { success: true };
            }
            return { success: false, error: result.error };
        } catch (error) {
            return { success: false, error: 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name, email, password) => {
        setLoading(true);
        try {
            const result = await api.post('/auth/signup', { name, email, password });
            if (result.success) {
                setUser(result.user);
                localStorage.setItem('user', JSON.stringify(result.user));
                setCurrentPage('dashboard');
                return { success: true };
            }
            return { success: false, error: result.error };
        } catch (error) {
            return { success: false, error: 'Signup failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setCurrentPage('landing');
    };

    const value = {
        user,
        currentPage,
        setCurrentPage,
        login,
        signup,
        logout,
        ideas,
        setIdeas,
        matches,
        setMatches,
        loading,
        setLoading,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ========================
// HEADER COMPONENT
// ========================

function Header() {
    const { user, currentPage, setCurrentPage, logout } = useAppContext();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <nav className="navbar">
                <div className="logo" onClick={() => setCurrentPage(user ? 'dashboard' : 'landing')}>
                    <span className="logo-icon">🚀</span>
                    Foundry<span style={{ color: '#818cf8' }}>AI</span>
                </div>

                {!user ? (
                    <>
                        <ul className="nav-links">
                            <li><a href="#features">Features</a></li>
                            <li><a href="#how-it-works">How It Works</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                        </ul>
                        <div className="nav-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('login')}>
                                Login
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => setCurrentPage('signup')}>
                                Get Started
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="nav-actions">
                        <span style={{ color: 'var(--text-secondary)', marginRight: '1rem' }}>
                            👋 {user.name}
                        </span>
                        <button className="btn btn-secondary btn-sm" onClick={logout}>
                            Logout
                        </button>
                    </div>
                )}
            </nav>
        </header>
    );
}

// ========================
// LANDING PAGE
// ========================

function LandingPage() {
    const { setCurrentPage } = useAppContext();

    return (
        <div>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span>✨</span>
                        <span>India's Largest Entrepreneurship Platform</span>
                    </div>

                    <h1>Build Your Startup<br />With AI & Co-Founders</h1>

                    <p>
                        Join 100,000+ founders. Validate your idea with AI, find perfect co-founders,
                        and build the next big thing in India's startup ecosystem.
                    </p>

                    <div className="hero-actions">
                        <button className="btn btn-primary btn-lg" onClick={() => setCurrentPage('signup')}>
                            Start Building Free 🚀
                        </button>
                        <button className="btn btn-secondary btn-lg" onClick={() => setCurrentPage('login')}>
                            Sign In
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-card">
                            <span className="stat-value">100K+</span>
                            <span className="stat-label">Active Founders</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">50K+</span>
                            <span className="stat-label">Ideas Validated</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">15K+</span>
                            <span className="stat-label">Co-Founder Matches</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">₹500Cr+</span>
                            <span className="stat-label">Funding Raised</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <div className="section-header">
                    <span className="section-badge">Features</span>
                    <h2>Everything You Need to Build</h2>
                    <p>From idea to exit, we've got you covered with AI-powered tools and India's best community</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>AI Copilot</h3>
                        <p>YC-style AI mentor asks probing questions, challenges assumptions, and guides execution. Available 24/7 in English & Hindi.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🤝</div>
                        <h3>Smart Co-Founder Matching</h3>
                        <p>ML-powered algorithm finds complementary skills, aligned vision, and compatible work styles. Not just keywords.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">💡</div>
                        <h3>Idea Validation</h3>
                        <p>Deep AI analysis of market fit, competition, monetization. Get actionable insights in minutes.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🎥</div>
                        <h3>Pitch Validation</h3>
                        <p>Upload your pitch video. Get scored by community + experts. Real feedback from real people.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🎓</div>
                        <h3>Learn & Earn</h3>
                        <p>Duolingo-style courses on validation, MVP, fundraising. Gamified, bite-sized, in Indian context.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🏛️</div>
                        <h3>Ecosystem Access</h3>
                        <p>Get connected to legal help, MVP builders, govt funding (Startup India, SISFS), and more.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

// ========================
// AUTH PAGES
// ========================

function LoginPage() {
    const { login, setCurrentPage, loading } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-tertiary)', marginBottom: '2rem' }}>
                    Sign in to continue building
                </p>

                {error && (
                    <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: '#f87171' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="founder@startup.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-tertiary)' }}>
                    Don't have an account?{' '}
                    <a onClick={() => setCurrentPage('signup')} style={{ cursor: 'pointer', color: 'var(--accent-purple)' }}>
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}

function SignupPage() {
    const { signup, setCurrentPage, loading } = useAppContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await signup(name, email, password);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Join FoundryAI</h2>
                <p style={{ color: 'var(--text-tertiary)', marginBottom: '2rem' }}>
                    Start your entrepreneurship journey today
                </p>

                {error && (
                    <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: '#f87171' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Rahul Sharma"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="founder@startup.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-tertiary)' }}>
                    Already have an account?{' '}
                    <a onClick={() => setCurrentPage('login')} style={{ cursor: 'pointer', color: 'var(--accent-purple)' }}>
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}

// ========================
// DASHBOARD COMPONENTS
// ========================

function Sidebar() {
    const { currentPage, setCurrentPage } = useAppContext();

    const navItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'ideas', icon: '💡', label: 'My Ideas' },
        { id: 'copilot', icon: '🤖', label: 'AI Copilot' },
        { id: 'matching', icon: '🤝', label: 'Find Co-Founders' },
        { id: 'pitches', icon: '🎥', label: 'Pitch Validation' },
        { id: 'learn', icon: '🎓', label: 'Learning' },
        { id: 'ecosystem', icon: '🏛️', label: 'Ecosystem' },
    ];

    return (
        <aside className="sidebar">
            <ul className="sidebar-nav">
                {navItems.map((item) => (
                    <li key={item.id}>
                        <a
                            className={currentPage === item.id ? 'active' : ''}
                            onClick={() => setCurrentPage(item.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

function Dashboard() {
    const { user } = useAppContext();

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <h1>Welcome back, {user.name}! 👋</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Let's build something amazing today
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="card">
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💡</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>3 Ideas</h3>
                        <p style={{ fontSize: '0.875rem' }}>Active projects</p>
                    </div>

                    <div className="card">
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤝</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>12 Matches</h3>
                        <p style={{ fontSize: '0.875rem' }}>Potential co-founders</p>
                    </div>

                    <div className="card">
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>60% Complete</h3>
                        <p style={{ fontSize: '0.875rem' }}>Validation course</p>
                    </div>

                    <div className="card">
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>850 Points</h3>
                        <p style={{ fontSize: '0.875rem' }}>Platform reputation</p>
                    </div>
                </div>

                <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <QuickActionCard
                        icon="💡"
                        title="Start New Idea"
                        description="Validate your next big idea with AI analysis"
                        gradient="var(--gradient-primary)"
                    />
                    <QuickActionCard
                        icon="🤖"
                        title="Chat with AI Copilot"
                        description="Get strategic advice on your startup"
                        gradient="var(--gradient-secondary)"
                    />
                    <QuickActionCard
                        icon="🎥"
                        title="Upload Pitch Video"
                        description="Get community feedback on your pitch"
                        gradient="var(--gradient-success)"
                    />
                </div>
            </main>
        </div>
    );
}

function QuickActionCard({ icon, title, description, gradient }) {
    return (
        <div className="card" style={{ cursor: 'pointer', background: `linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%), ${gradient}` }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
            <h3 style={{ marginBottom: '0.5rem', color: 'white' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>{description}</p>
        </div>
    );
}

// Ideas Page
function IdeasPage() {
    const { user, setCurrentPage } = useAppContext();
    const [ideas, setIdeas] = useState([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchIdeas();
    }, []);

    const fetchIdeas = async () => {
        const result = await api.get(`/ideas?userId=${user.id}`);
        if (result.success) {
            setIdeas(result.ideas);
        }
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1>My Ideas 💡</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Track and validate your startup ideas</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        + New Idea
                    </button>
                </div>

                {showForm && <IdeaForm onClose={() => setShowForm(false)} onSubmit={fetchIdeas} />}

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {ideas.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💡</div>
                            <h3>No ideas yet</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                Start by submitting your first startup idea
                            </p>
                            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                                Create Your First Idea
                            </button>
                        </div>
                    ) : (
                        ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
                    )}
                </div>
            </main>
        </div>
    );
}

function IdeaForm({ onClose, onSubmit }) {
    const { user } = useAppContext();
    const [formData, setFormData] = useState({
        title: '',
        problem: '',
        description: '',
        category: 'fintech',
        stage: 'idea',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await api.post('/ideas', { ...formData, userId: user.id });
        if (result.success) {
            onSubmit();
            onClose();
        }
    };

    return (
        <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Idea</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Idea Title</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., AI-powered financial advisor for tier 2 cities"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Problem Statement</label>
                    <textarea
                        className="form-textarea"
                        placeholder="What problem are you solving? Who has this problem?"
                        value={formData.problem}
                        onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Solution Description</label>
                    <textarea
                        className="form-textarea"
                        placeholder="How does your solution work? What makes it unique?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            className="form-select"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="fintech">Fintech</option>
                            <option value="healthtech">Healthtech</option>
                            <option value="edtech">Edtech</option>
                            <option value="saas">SaaS</option>
                            <option value="ecommerce">E-commerce</option>
                            <option value="agritech">Agritech</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Current Stage</label>
                        <select
                            className="form-select"
                            value={formData.stage}
                            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                        >
                            <option value="idea">Idea</option>
                            <option value="validation">Validation</option>
                            <option value="mvp">MVP</option>
                            <option value="revenue">Revenue</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary">
                        Create Idea & Get AI Analysis
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

function IdeaCard({ idea }) {
    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>{idea.title}</h3>
                <span className="badge badge-primary">{idea.stage}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{idea.problem}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-info">{idea.category}</span>
                <span className="badge badge-success">
                    {new Date(idea.createdAt).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}

// AI Copilot Page
function CopilotPage() {
    const { user } = useAppContext();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your AI startup copilot. I'll ask tough questions like Paul Graham to help you build a great company. What are you working on?",
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages([...messages, userMessage]);
        setInput('');
        setLoading(true);

        const result = await api.post('/copilot/chat', {
            userId: user.id,
            message: input,
        });

        if (result.success) {
            setMessages((prev) => [...prev, { role: 'assistant', content: result.response }]);
        }
        setLoading(false);
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <h1>AI Copilot 🤖</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Your 24/7 YC-style startup advisor
                </p>

                <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', marginBottom: '1rem' }}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                style={{
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '70%',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--glass-bg)',
                                        color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                    }}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-tertiary)' }}>
                                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                AI is thinking...
                            </div>
                        )}
                    </div>

                    <form onSubmit={sendMessage} style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ask anything about your startup..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            Send
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

// Matching Page
function MatchingPage() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        const result = await api.get('/matches?userId=123');
        if (result.success) {
            setMatches(result.matches);
        }
        setLoading(false);
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <h1>Find Co-Founders 🤝</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    AI-powered matching based on skills, vision & compatibility
                </p>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {matches.map((match) => (
                        <div key={match.id} className="card">
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{ fontSize: '4rem' }}>{match.avatar}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h3>{match.name}</h3>
                                        <span className="badge badge-success">{(match.matchScore * 100).toFixed(0)}% Match</span>
                                    </div>
                                    <p style={{ color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>{match.role}</p>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{match.bio}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        {match.skills.map((skill, idx) => (
                                            <span key={idx} className="badge badge-info">{skill}</span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className="btn btn-primary btn-sm">Connect</button>
                                        <button className="btn btn-secondary btn-sm">View Profile</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

// Learn Page
function LearnPage() {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        const result = await api.get('/courses');
        if (result.success) {
            setCourses(result.courses);
        }
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <h1>Learning Hub 🎓</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Duolingo-style courses for entrepreneurship
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {courses.map((course) => (
                        <div key={course.id} className="card">
                            <h3 style={{ marginBottom: '0.5rem' }}>{course.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                {course.description}
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span className="badge badge-info">{course.modules} modules</span>
                                <span className="badge badge-primary">{course.duration}</span>
                                <span className="badge badge-warning">{course.difficulty}</span>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%' }}>
                                Start Course
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

// ========================
// MAIN APP
// ========================

function App() {
    const { currentPage, user } = useAppContext();

    const renderPage = () => {
        if (!user) {
            switch (currentPage) {
                case 'login':
                    return <LoginPage />;
                case 'signup':
                    return <SignupPage />;
                default:
                    return <LandingPage />;
            }
        }

        switch (currentPage) {
            case 'ideas':
                return <IdeasPage />;
            case 'copilot':
                return <CopilotPage />;
            case 'matching':
                return <MatchingPage />;
            case 'learn':
                return <LearnPage />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <>
            <Header />
            {renderPage()}
        </>
    );
}

// ========================
// RENDER APP
// ========================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AppProvider>
        <App />
    </AppProvider>
);
