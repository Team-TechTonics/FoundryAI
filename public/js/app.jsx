const { useState, useEffect, createContext, useContext } = React;

// ========================
// CONTEXT & STATE
// ========================

const AppContext = createContext();
const useAppContext = () => useContext(AppContext);

// API Configuration
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

// App Provider
function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('landing');
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

    return (
        <AppContext.Provider value={{ user, currentPage, setCurrentPage, login, signup, logout, loading }}>
            {children}
        </AppContext.Provider>
    );
}

// ========================
// ICON COMPONENTS
// ========================

const Icon = ({ name, size = 20, color = 'currentColor' }) => {
    const icons = {
        home: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
        lightbulb: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M9 18h6M10 22h4M15 8h.01M9 8.01V8M12 2a6 6 0 0 0-6 6c0 3.66 2.33 5.5 3 7h6c.67-1.5 3-3.34 3-7a6 6 0 0 0-6-6z"></path></svg>`,
        brain: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M12 2a4 4 0 0 0-4 4v1a4 4 0 0 0-4 4v1a4 4 0 0 0 4 4h1a4 4 0 0 0 4-4v-1a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4h-1z"></path></svg>`,
        users: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
        book: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
        check: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        trending: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
        clock: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
        target: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
        plus: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
        menu: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
        rocket: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`,
    };

    return <span dangerouslySetInnerHTML={{ __html: icons[name] || icons.home }} />;
};

// ========================
// HEADER
// ========================

function Header() {
    const { user, setCurrentPage, logout } = useAppContext();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <nav className="navbar">
                <div className="logo" onClick={() => setCurrentPage(user ? 'dashboard' : 'landing')} style={{ cursor: 'pointer' }}>
                    <Icon name="rocket" size={24} />
                    <span className="logo-text">FoundryAI</span>
                </div>

                {!user && (
                    <>
                        <ul className="nav-links">
                            <li><a href="#features">Features</a></li>
                            <li><a href="#how-it-works">How it Works</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                        </ul>
                        <div className="nav-actions">
                            <button className="btn btn-outline btn-sm" onClick={() => setCurrentPage('login')}>
                                Sign In
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => setCurrentPage('signup')}>
                                Get Started
                            </button>
                        </div>
                    </>
                )}

                {user && (
                    <div className="nav-actions">
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginRight: 'var(--space-3)' }}>
                            {user.name}
                        </span>
                        <button className="btn btn-outline btn-sm" onClick={logout}>
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
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span style={{ marginRight: '6px' }}>●</span>
                            TRUSTED BY 100,000+ FOUNDERS
                        </div>

                        <h1 className="text-balance">
                            Build Your Startup<br />
                            With AI-Powered <span className="text-gradient">Intelligence</span>
                        </h1>

                        <p style={{ maxWidth: '700px', margin: '0 auto var(--space-8)' }}>
                            A comprehensive platform that combines AI validation, co-founder matching,
                            and strategic guidance to help Indian entrepreneurs succeed. From idea to execution.
                        </p>

                        <div className="hero-actions">
                            <button className="btn btn-primary btn-lg" onClick={() => setCurrentPage('signup')}>
                                Start Building Free
                            </button>
                            <button className="btn btn-secondary btn-lg">
                                Watch Demo
                            </button>
                        </div>

                        <div className="hero-stats">
                            <div className="stat-card">
                                <div className="stat-value">100K+</div>
                                <div className="stat-label">Active Founders</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">50K+</div>
                                <div className="stat-label">Ideas Validated</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">15K+</div>
                                <div className="stat-label">Successful Matches</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">₹500Cr+</div>
                                <div className="stat-label">Funding Raised</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="section" style={{ background: 'white' }}>
                <div className="container">
                    <div className="section-header">
                        <h6 className="section-badge">FEATURES</h6>
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Everything you need to succeed</h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                            Comprehensive tools for every stage of your entrepreneurial journey
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 'var(--space-6)'
                    }}>
                        <FeatureCard
                            icon="brain"
                            title="AI Validation Engine"
                            description="Get instant market analysis, competitive insights, and viability scores for your startup idea using advanced AI."
                        />
                        <FeatureCard
                            icon="users"
                            title="Co-Founder Matching"
                            description="Find your ideal co-founder with ML-powered compatibility scoring based on skills, experience, and working style."
                        />
                        <FeatureCard
                            icon="target"
                            title="Strategic Guidance"
                            description="Receive YC-style questioning and personalized roadmaps tailored to India's startup ecosystem."
                        />
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="section">
                <div className="container">
                    <div className="section-header">
                        <h6 className="section-badge">HOW IT WORKS</h6>
                        <h2>Your path from idea to execution</h2>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 'var(--space-8)',
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}>
                        <StepCard number="1" title="Submit Your Idea" description="Share your startup concept and get instant AI feedback" />
                        <StepCard number="2" title="Get Validated" description="Receive market analysis and actionable insights" />
                        <StepCard number="3" title="Find Co-Founders" description="Match with complementary skill sets" />
                        <StepCard number="4" title="Start Building" description="Execute with guided roadmaps and resources" />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section" style={{ background: 'white' }}>
                <div className="container">
                    <div className="card" style={{
                        padding: 'var(--space-12)',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        border: 'none',
                        color: 'white'
                    }}>
                        <h2 style={{ color: 'white', marginBottom: 'var(--space-4)' }}>
                            Ready to build the next big thing?
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto var(--space-8)', fontSize: '1.125rem' }}>
                            Join thousands of founders who are turning their ideas into successful startups with FoundryAI.
                        </p>
                        <button className="btn btn-lg" style={{ background: 'white', color: 'var(--brand-primary)' }} onClick={() => setCurrentPage('signup')}>
                            Get Started Free
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Helper Components
function FeatureCard({ icon, title, description }) {
    return (
        <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
            <div style={{
                display: 'inline-flex',
                padding: 'var(--space-4)',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-4)',
                color: 'var(--brand-primary)'
            }}>
                <Icon name={icon} size={24} />
            </div>
            <h4 style={{ marginBottom: 'var(--space-3)' }}>{title}</h4>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', margin: 0 }}>{description}</p>
        </div>
    );
}

function StepCard({ number, title, description }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{
                width: '48px',
                height: '48px',
                margin: '0 auto var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--brand-primary)',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                fontSize: '1.25rem',
                fontWeight: 700
            }}>
                {number}
            </div>
            <h4 style={{ marginBottom: 'var(--space-2)' }}>{title}</h4>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', margin: 0 }}>{description}</p>
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
        if (!result.success) setError(result.error);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
            <div className="card" style={{ maxWidth: '440px', width: '100%', padding: 'var(--space-8)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <Icon name="rocket" size={40} color="var(--brand-primary)" />
                    </div>
                    <h2 style={{ marginBottom: 'var(--space-2)' }}>Welcome back</h2>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                        Sign in to continue to FoundryAI
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: 'var(--space-4)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-5)',
                        color: '#dc2626',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="you@company.com"
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
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    Don't have an account?{' '}
                    <a onClick={() => setCurrentPage('signup')} style={{ cursor: 'pointer', color: 'var(--brand-primary)', fontWeight: 600 }}>
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
        if (!result.success) setError(result.error);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
            <div className="card" style={{ maxWidth: '440px', width: '100%', padding: 'var(--space-8)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <Icon name="rocket" size={40} color="var(--brand-primary)" />
                    </div>
                    <h2 style={{ marginBottom: 'var(--space-2)' }}>Create your account</h2>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                        Start building your startup today
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: 'var(--space-4)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-5)',
                        color: '#dc2626',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full name</label>
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
                        <label className="form-label">Email address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="you@company.com"
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
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    Already have an account?{' '}
                    <a onClick={() => setCurrentPage('login')} style={{ cursor: 'pointer', color: 'var(--brand-primary)', fontWeight: 600 }}>
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}

// ========================
// DASHBOARD
// ========================

function Dashboard() {
    const { user } = useAppContext();
    const [activeTab, setActiveTab] = useState('overview');
    const [ideas, setIdeas] = useState([
        { id: 1, title: 'AI-Powered Education Platform', stage: 'Validation', score: 87, market: 'EdTech', created: '2 days ago' },
        { id: 2, title: 'Sustainable Fashion Marketplace', stage: 'Ideation', score: 72, market: 'E-commerce', created: '5 days ago' },
        { id: 3, title: 'HealthTech Telemedicine', stage: 'MVP', score: 91, market: 'Healthcare', created: '1 week ago' },
    ]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)', paddingTop: 'var(--header-height)' }}>
            {/* Sidebar */}
            <aside className="sidebar">
                <nav style={{ padding: '0' }}>
                    <SidebarLink active={activeTab === 'overview'} icon="home" label="Overview" onClick={() => setActiveTab('overview')} />
                    <SidebarLink active={activeTab === 'ideas'} icon="lightbulb" label="Ideas" onClick={() => setActiveTab('ideas')} />
                    <SidebarLink active={activeTab === 'copilot'} icon="brain" label="AI Copilot" onClick={() => setActiveTab('copilot')} />
                    <SidebarLink active={activeTab === 'matches'} icon="users" label="Co-Founders" onClick={() => setActiveTab('matches')} />
                    <SidebarLink active={activeTab === 'resources'} icon="book" label="Resources" onClick={() => setActiveTab('resources')} />
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: 'var(--space-6)' }}>
                <div className="container" style={{ maxWidth: '1200px' }}>
                    {activeTab === 'overview' && <OverviewTab user={user} ideas={ideas} setActiveTab={setActiveTab} />}
                    {activeTab === 'ideas' && <IdeasTab ideas={ideas} />}
                    {activeTab === 'copilot' && <CopilotTab />}
                    {activeTab === 'matches' && <MatchesTab />}
                    {activeTab === 'resources' && <ResourcesTab />}
                </div>
            </main>
        </div>
    );
}

// Dashboard Tabs
function OverviewTab({ user, ideas, setActiveTab }) {
    return (
        <>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>Welcome back, {user.name}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Here's what's happening with your ventures</p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--space-5)',
                marginBottom: 'var(--space-10)'
            }}>
                <StatCard icon="lightbulb" title="Active Ideas" value="3" change="+2 this week" trend="up" />
                <StatCard icon="check" title="Validations" value="12" change="87% avg score" trend="up" />
                <StatCard icon="users" title="Matches" value="5" change="2 new" trend="up" />
                <StatCard icon="clock" title="AI Time" value="24h" change="This month" trend="neutral" />
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 'var(--space-10)' }}>
                <h3 style={{ marginBottom: 'var(--space-5)' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
                    <ActionCard
                        icon="plus"
                        title="Submit New Idea"
                        description="Get AI-powered validation in minutes"
                        onClick={() => setActiveTab('ideas')}
                    />
                    <ActionCard
                        icon="brain"
                        title="Ask AI Copilot"
                        description="Get strategic guidance on your venture"
                        onClick={() => setActiveTab('copilot')}
                    />
                    <ActionCard
                        icon="users"
                        title="Find Co-Founders"
                        description="Match with complementary skill sets"
                        onClick={() => setActiveTab('matches')}
                    />
                </div>
            </div>

            {/* Recent Ideas */}
            <div>
                <h3 style={{ marginBottom: 'var(--space-5)' }}>Your Ideas</h3>
                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    {ideas.map(idea => (
                        <IdeaCard key={idea.id} idea={idea} />
                    ))}
                </div>
            </div>
        </>
    );
}

function IdeasTab({ ideas }) {
    return (
        <>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>Your Ideas</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage and validate your startup concepts</p>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
                <button className="btn btn-primary">
                    <Icon name="plus" size={16} />
                    Submit New Idea
                </button>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                {ideas.map(idea => (
                    <IdeaCard key={idea.id} idea={idea} detailed />
                ))}
            </div>
        </>
    );
}

function CopilotTab() {
    return (
        <>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>AI Copilot</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Your strategic advisor for venture building</p>
            </div>

            <div className="card" style={{ padding: 'var(--space-12)', minHeight: '500px', textAlign: 'center' }}>
                <div style={{ paddingTop: 'var(--space-16)' }}>
                    <div style={{ color: 'var(--brand-primary)', marginBottom: 'var(--space-4)' }}>
                        <Icon name="brain" size={64} color="var(--brand-primary)" />
                    </div>
                    <h3 style={{ marginBottom: 'var(--space-3)' }}>AI Copilot Coming Soon</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                        Get YC-style questioning, market analysis, and strategic guidance powered by advanced AI
                    </p>
                </div>
            </div>
        </>
    );
}

function MatchesTab() {
    const matches = [
        { id: 1, name: 'Priya Sharma', role: 'Full-Stack Developer', skills: ['React', 'Node.js', 'AWS'], match: 92, location: 'Bangalore' },
        { id: 2, name: 'Arjun Patel', role: 'Product Designer', skills: ['Figma', 'UX Research', 'Branding'], match: 87, location: 'Mumbai' },
        { id: 3, name: 'Ravi Kumar', role: 'Growth Marketer', skills: ['SEO', 'Analytics', 'Content'], match: 84, location: 'Delhi' },
    ];

    return (
        <>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>Co-Founder Matches</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Find your ideal co-founder based on skills and compatibility</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
                {matches.map(match => (
                    <CoFounderCard key={match.id} {...match} />
                ))}
            </div>
        </>
    );
}

function ResourcesTab() {
    return (
        <>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>Resources</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Learn and grow with curated content</p>
            </div>

            <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                <div style={{ color: 'var(--brand-primary)', marginBottom: 'var(--space-4)' }}>
                    <Icon name="book" size={64} color="var(--brand-primary)" />
                </div>
                <h3 style={{ marginBottom: 'var(--space-3)' }}>Coming Soon</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Courses, templates, and guides for Indian founders</p>
            </div>
        </>
    );
}

// Helper Components
function SidebarLink({ active, icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`sidebar-link ${active ? 'active' : ''}`}
        >
            <Icon name={icon} size={18} />
            <span>{label}</span>
        </button>
    );
}

function StatCard({ icon, title, value, change, trend }) {
    return (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div style={{ color: 'var(--brand-primary)' }}>
                    <Icon name={icon} size={20} />
                </div>
                {trend === 'up' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)' }}>
                        <Icon name="trending" size={14} />
                    </span>
                )}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                {value}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
                {title}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 500 }}>
                {change}
            </div>
        </div>
    );
}

function ActionCard({ icon, title, description, onClick }) {
    return (
        <div className="card" onClick={onClick} style={{ padding: 'var(--space-6)', cursor: 'pointer' }}>
            <div style={{ color: 'var(--brand-primary)', marginBottom: 'var(--space-4)' }}>
                <Icon name={icon} size={24} />
            </div>
            <h4 style={{ marginBottom: 'var(--space-2)' }}>{title}</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: 0 }}>{description}</p>
        </div>
    );
}

function IdeaCard({ idea, detailed }) {
    return (
        <div className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: 'var(--space-2)' }}>{idea.title}</h4>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                        <span>{idea.market}</span>
                        <span>•</span>
                        <span>{idea.stage}</span>
                        <span>•</span>
                        <span>{idea.created}</span>
                    </div>
                </div>
                <div className="badge badge-primary" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                    {idea.score}% Match
                </div>
            </div>
            {detailed && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-light)' }}>
                    AI validation complete. Market size: Large. Competition: Moderate. Recommendation: Proceed to MVP phase.
                </p>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: detailed ? 'none' : '1px solid var(--border-light)' }}>
                <button className="btn btn-sm btn-primary">View Details</button>
                <button className="btn btn-sm btn-secondary">AI Analysis</button>
            </div>
        </div>
    );
}

function CoFounderCard({ name, role, skills, match, location }) {
    const initials = name.split(' ').map(n => n[0]).join('');

    return (
        <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--brand-primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: 'var(--space-4)'
            }}>
                {initials}
            </div>
            <h4 style={{ marginBottom: 'var(--space-1)' }}>{name}</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>{role}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>{location}</p>

            <div style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {skills.map(skill => (
                        <span key={skill} className="badge" style={{
                            padding: '0.375rem 0.75rem',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-light)',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            borderRadius: 'var(--radius-sm)'
                        }}>
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            <div style={{
                padding: 'var(--space-4)',
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: 'var(--space-1)' }}>{match}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Match Score</div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }}>Connect</button>
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
            if (currentPage === 'login') return <LoginPage />;
            if (currentPage === 'signup') return <SignupPage />;
            return <LandingPage />;
        }
        return <Dashboard />;
    };

    return (
        <>
            <Header />
            {renderPage()}
        </>
    );
}

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AppProvider>
        <App />
    </AppProvider>
);
