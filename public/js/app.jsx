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
                setCurrentPage('profile-setup'); // Redirect to profile setup first
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
        <AppContext.Provider value={{ user, setUser, currentPage, setCurrentPage, login, signup, logout, loading }}>
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
        x: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
        book: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
        check: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        trending: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
        clock: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
        target: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
        plus: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
        menu: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
        rocket: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`,
        user: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
        bell: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
        'message-square': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
        send: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
        video: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`,
        'external-link': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
        x: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    };

    return <span dangerouslySetInnerHTML={{ __html: icons[name] || icons.home }} />;
};

// ========================
// HEADER
// ========================

function Header() {
    const { user, setCurrentPage, logout } = useAppContext();
    const [scrolled, setScrolled] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!user) return;
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`/api/matches/requests?userId=${user.id}`);
                const data = await res.json();
                if (data.success && data.requests) {
                    setNotificationCount(data.requests.length);
                }
            } catch (e) { console.error(e); }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user]);

    const handleBellClick = () => {
        if (user) setCurrentPage('dashboard');
        // We can't easily force Dashboard tab switch from here without context, 
        // but navigating to dashboard is a good start. 
        // ideally notify dashboard via context or event.
        // For MVP, user clicks bell -> goes to Dashboard. User can then click 'Co-Founders'.
        // Better: Dispatch custom event?
        window.dispatchEvent(new CustomEvent('navigate-to-matches'));
    };

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <nav className="navbar">
                <div className="logo" onClick={() => setCurrentPage(user ? 'dashboard' : 'landing')} style={{ cursor: 'pointer' }}>
                    <Icon name="rocket" size={24} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.125rem', lineHeight: 1 }}>FoundryAI</span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '0.03em' }}>
                            ENTREPRENEURSHIP OS
                        </span>
                    </div>
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
                        <button
                            onClick={handleBellClick}
                            style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, marginRight: 10 }}
                            title="Notifications"
                        >
                            <Icon name="bell" size={20} color="var(--text-secondary)" />
                            {notificationCount > 0 && (
                                <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid var(--bg-primary)' }}></span>
                            )}
                        </button>

                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', marginRight: 'var(--space-3)' }}>
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

// ========================
// PROFILE SETUP
// ========================

function ProfileSetupPage() {
    const { user, setUser, setCurrentPage } = useAppContext();
    const [stage, setStage] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Convert skills string to array
            const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);

            const response = await fetch(`/api/users/${user.id}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stage,
                    bio,
                    skills: skillsArray,
                    location
                })
            });

            const data = await response.json();

            if (data.success) {
                // Update user in localStorage
                const updatedUser = { ...user, stage, bio, skills: skillsArray, location };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setCurrentPage('dashboard');
            } else {
                setError(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update error:', error);
            setError(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', background: 'var(--bg-secondary)' }}>
            <div className="card" style={{ maxWidth: '600px', width: '100%', padding: 'var(--space-8)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <Icon name="user" size={40} color="var(--brand-primary)" />
                    </div>
                    <h2 style={{ marginBottom: 'var(--space-2)' }}>Complete Your Profile</h2>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem' }}>
                        Tell us about your entrepreneurial journey
                    </p>
                </div>

                {error && (
                    <div style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', background: '#fee', borderRadius: 'var(--radius-md)', color: '#c00', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Current Stage</label>
                        <select
                            className="form-input"
                            value={stage}
                            onChange={(e) => setStage(e.target.value)}
                            required
                        >
                            <option value="">Select your stage</option>
                            <option value="Ideation">Ideation</option>
                            <option value="Validation">Validation</option>
                            <option value="MVP">MVP Development</option>
                            <option value="Launch">Launch</option>
                            <option value="Growth">Growth</option>
                            <option value="Scaling">Scaling</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Bangalore, India"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Skills (comma-separated)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., React, Node.js, Marketing, Design"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            required
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 'var(--space-2)', display: 'block' }}>
                            Separate skills with commas
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bio</label>
                        <textarea
                            className="form-input"
                            placeholder="Tell us about your background and what you're building..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            required
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Saving...' : 'Complete Setup'}
                    </button>
                </form>
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

function ValidationFeed({ user }) {
    const [ideas, setIdeas] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [voteType, setVoteType] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');

    const fetchFeed = React.useCallback(async () => {
        setLoading(true);
        try {
            const result = await api.get(`/ideas/feed?userId=${user.id}`);
            if (result.success) {
                setIdeas(result.ideas);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to load feed (Database updated?)');
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    const handleVote = (type) => {
        setVoteType(type);
        setShowFeedback(true);
    };

    const submitVote = async () => {
        if (feedback.length < 5) {
            alert('Feedback must be at least 5 characters');
            return;
        }

        setVoting(true);
        try {
            const currentIdea = ideas[currentIndex];
            const result = await api.post(`/ideas/${currentIdea.id}/validate`, {
                userId: user.id,
                voteType,
                feedback
            });

            if (result.success) {
                setFeedback('');
                setShowFeedback(false);
                setCurrentIndex(prev => prev + 1);
            } else {
                alert(result.error || 'Failed to submit');
            }
        } catch (err) {
            alert('Failed to submit validation');
        } finally {
            setVoting(false);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading fresh ideas...</div>;
    if (error) return <div style={{ padding: 40, color: 'red', textAlign: 'center' }}>Error: {error} <br /><button className="btn btn-secondary" onClick={() => window.location.reload()}>Retry</button></div>;

    if (currentIndex >= ideas.length) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: 40 }}>
                <Icon name="check" size={64} color="var(--brand-primary)" />
                <h3>You're all caught up!</h3>
                <p style={{ color: 'var(--text-tertiary)' }}>Check back later to validate more ideas.</p>
                <button className="btn btn-secondary" onClick={fetchFeed}>Refresh Feed</button>
            </div>
        );
    }

    const idea = ideas[currentIndex];

    return (
        <div style={{ height: 'calc(100vh - 140px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{
                height: '100%',
                background: 'var(--bg-secondary)', // Simpler background
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                alignItems: 'stretch', // Full height
                gap: 'var(--space-8)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-color)',
                position: 'relative',
                flexWrap: 'wrap', // Responsive
                overflowY: 'auto'
            }}>
                {/* Left Panel: Video (Flex 2 - 60-70% width) */}
                <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', minHeight: '400px', justifyContent: 'center' }}>
                    {idea.media_url ? (
                        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                            {(() => {
                                const url = idea.media_url;
                                const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/);

                                if (ytMatch) {
                                    return (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            style={{ display: 'block' }}
                                        ></iframe>
                                    );
                                } else if (url.includes('loom.com/share')) {
                                    return (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={url.replace('share', 'embed')}
                                            frameBorder="0"
                                            allowFullScreen
                                            style={{ display: 'block' }}
                                        ></iframe>
                                    );
                                } else if (url.includes('vimeo.com')) {
                                    const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
                                    if (vimeoId) {
                                        return (
                                            <iframe
                                                src={`https://player.vimeo.com/video/${vimeoId}`}
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                allow="autoplay; fullscreen; picture-in-picture"
                                                allowFullScreen
                                                style={{ display: 'block' }}
                                            ></iframe>
                                        );
                                    }
                                } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
                                    return (
                                        <video controls width="100%" height="100%" style={{ display: 'block', objectFit: 'contain' }}>
                                            <source src={url} />
                                        </video>
                                    );
                                }
                                return (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)' }}>
                                        <Icon name="video" size={48} color="var(--brand-primary)" />
                                        <p style={{ marginTop: 20 }}>Preview Unavailable</p>
                                        <a href={url} target="_blank" className="btn btn-primary" style={{ marginTop: 10 }}>Open Link</a>
                                    </div>
                                );
                            })()}
                        </div>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ textAlign: 'center', maxWidth: 400 }}>
                                <Icon name="lightbulb" size={64} color="var(--brand-primary)" />
                                <h3>No Video Pitch</h3>
                                <p>This idea focuses on the text description.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Details (Flex 1 - 30-40% width) */}
                <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '5px' }}>

                    {/* Founder Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-6)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            {(idea.users?.name || 'U')[0]}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{idea.users?.name || 'Founder'}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{idea.users?.stage || 'Validation Stage'} • {idea.market || 'Tech'}</div>
                        </div>
                    </div>

                    <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', lineHeight: 1.2, fontWeight: 800 }}>{idea.title}</h1>

                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7, marginBottom: 8, fontWeight: 700 }}>Problem</h3>
                        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{idea.problem}</p>
                    </div>

                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7, marginBottom: 8, fontWeight: 700 }}>Solution</h3>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500 }}>{idea.solution || idea.description}</p>
                    </div>

                    {/* Vote Buttons (Fixed at bottom of this column or flowing) */}
                    <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 'var(--space-6)', justifyContent: 'center' }}>
                        <button
                            onClick={() => handleVote('cross')}
                            style={{
                                width: 70, height: 70, borderRadius: '50%', background: 'var(--bg-primary)', border: '2px solid #fecaca',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                color: '#ef4444', transition: 'all 0.2s',
                            }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#fef2f2'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
                        >
                            <Icon name="x" size={32} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: 4 }}>Pass</span>
                        </button>
                        <button
                            onClick={() => handleVote('tick')}
                            style={{
                                width: 70, height: 70, borderRadius: '50%', background: 'var(--bg-primary)', border: '2px solid #bbf7d0',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                color: '#22c55e', transition: 'all 0.2s',
                            }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = '#f0fdf4'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
                        >
                            <Icon name="check" size={32} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: 4 }}>Validate</span>
                        </button>
                    </div>
                </div>
            </div>

            {showFeedback && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(5px)', zIndex: 10 }}>
                    <div style={{ background: 'var(--bg-primary)', padding: 30, borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 500, border: '1px solid var(--border-color)' }}>
                        <h3 style={{ marginBottom: 10, fontSize: '1.25rem' }}>{voteType === 'tick' ? 'What stood out?' : 'What needs improvement?'}</h3>
                        <p style={{ marginBottom: 20, color: 'var(--text-tertiary)' }}>Constructive feedback helps founders grow.</p>
                        <textarea
                            className="form-input" rows={4} placeholder="Your feedback here (min 5 chars)..."
                            value={feedback} onChange={e => setFeedback(e.target.value)} autoFocus
                        />
                        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowFeedback(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={submitVote} disabled={voting || feedback.length < 5}>
                                {voting ? 'Submitting...' : 'Send Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Dashboard() {
    const { user } = useAppContext();
    const [activeTab, setActiveTab] = useState('overview');
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user's ideas from API
    // Define fetchIdeas inside useCallback so it can be passed down
    const fetchIdeas = React.useCallback(async () => {
        if (!user?.id) return;
        // ... (fetch logic omitted for brevity, keeping existing)
        try {
            const response = await fetch(`/api/ideas?userId=${user.id}`);
            const data = await response.json();

            if (data.success) {
                const transformedIdeas = data.ideas.map(idea => ({
                    id: idea.id,
                    title: idea.title,
                    stage: idea.stage || 'Ideation',
                    score: idea.validation_score || 0,
                    market: idea.market || 'General',
                    created: formatDate(idea.created_at),
                    validations: idea.idea_validations || [],
                    media_url: idea.media_url
                }));
                // Check if component is still mounted logic not strictly needed with simple state but good practice
                setIdeas(transformedIdeas);
            }
        } catch (error) {
            console.error('Error fetching ideas:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchIdeas();
    }, [fetchIdeas]);

    // Handle Bell Icon Navigation
    useEffect(() => {
        const handleNavigation = () => setActiveTab('matches');
        window.addEventListener('navigate-to-matches', handleNavigation);
        return () => window.removeEventListener('navigate-to-matches', handleNavigation);
    }, []);

    // Helper function to format dates
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? 's' : ''} ago`;
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)', paddingTop: 'var(--header-height)' }}>
            {/* Sidebar with Grouping */}
            <aside className="sidebar">
                <nav style={{ padding: '0' }}>
                    {/* CORE Section */}
                    <div style={{
                        padding: '0 var(--space-5)',
                        marginBottom: 'var(--space-3)',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase'
                    }}>
                        CORE
                    </div>
                    <SidebarLink active={activeTab === 'overview'} icon="home" label="Overview" onClick={() => setActiveTab('overview')} />
                    <SidebarLink active={activeTab === 'ideas'} icon="lightbulb" label="Ideas" onClick={() => setActiveTab('ideas')} />
                    <SidebarLink active={activeTab === 'validate'} icon="check" label="Validate" onClick={() => setActiveTab('validate')} />
                    <SidebarLink active={activeTab === 'copilot'} icon="brain" label="AI Copilot" onClick={() => setActiveTab('copilot')} />

                    {/* BUILD Section */}
                    <div style={{
                        padding: '0 var(--space-5)',
                        marginTop: 'var(--space-6)',
                        marginBottom: 'var(--space-3)',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase'
                    }}>
                        BUILD
                    </div>
                    <SidebarLink active={activeTab === 'matches'} icon="users" label="Co-Founders" onClick={() => setActiveTab('matches')} />
                    <SidebarLink active={activeTab === 'messages'} icon="message-square" label="Messages" onClick={() => setActiveTab('messages')} />
                    <SidebarLink active={activeTab === 'resources'} icon="book" label="Resources" onClick={() => setActiveTab('resources')} />
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: 'var(--sidebar-width)', flex: 1, padding: 'var(--space-6)' }}>
                <div className="container" style={{ maxWidth: '1200px' }}>
                    {activeTab === 'overview' && <OverviewTab user={user} ideas={ideas} setActiveTab={setActiveTab} />}
                    {activeTab === 'ideas' && <IdeasTab user={user} ideas={ideas} onRefresh={fetchIdeas} />}
                    {activeTab === 'validate' && <ValidationFeed user={user} />}
                    {activeTab === 'copilot' && <CopilotTab />}
                    {activeTab === 'matches' && <MatchesTab />}
                    {activeTab === 'messages' && <MessagesTab />}
                    {activeTab === 'resources' && <ResourcesTab />}
                </div>
            </main>
        </div>
    );
}

// Dashboard Tabs
function OverviewTab({ user, ideas, setActiveTab }) {
    const activeIdeasCount = ideas.length;
    const avgScore = activeIdeasCount > 0
        ? Math.round(ideas.reduce((acc, i) => acc + (i.score || 0), 0) / activeIdeasCount)
        : 0;
    const validatedIdeasCount = ideas.filter(i => (i.score || 0) > 70).length;
    const [matchesCount, setMatchesCount] = useState(0);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await fetch(`/api/matches?userId=${user.id}`);
                const data = await res.json();
                if (data.success && data.matches) {
                    setMatchesCount(data.matches.length);
                }
            } catch (e) {
                console.error("Failed to fetch match count", e);
            }
        };
        fetchMatches();
    }, [user.id]);

    return (
        <>
            <div style={{ marginBottom: 'var(--space-10)' }}>
                <h1 style={{ marginBottom: 'var(--space-2)', fontSize: '1.75rem', fontWeight: 700 }}>Founder Dashboard</h1>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                    {user.name} · {user.stage || 'Aspiring'} Founder
                </p>
            </div>

            {/* Founder Status - The Power Section */}
            <div className="card" style={{
                padding: 'var(--space-6)',
                marginBottom: 'var(--space-10)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.15)'
            }}>
                <h4 style={{ marginBottom: 'var(--space-4)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                    Founder Status
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-5)' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>Current Focus</div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.stage || 'Ideation'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>Blockers</div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Validation, MVP Scoping</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>Suggested Action</div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--brand-primary)' }}>{activeIdeasCount === 0 ? 'Submit first idea' : 'Validate core assumptions'}</div>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Improved */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--space-5)',
                marginBottom: 'var(--space-10)'
            }}>
                <StatCard icon="lightbulb" title="Active Ideas" value={activeIdeasCount} change="Total Concepts" trend="neutral" />
                <StatCard icon="check" title="Avg Validation Score" value={`${avgScore}%`} change={`${validatedIdeasCount} ideas validated`} trend={avgScore > 50 ? 'up' : 'neutral'} />
                <StatCard icon="users" title="Co-Founder Matches" value={matchesCount} change="Potential Matches" trend="up" />
                <StatCard icon="target" title="Stage Progress" value={user.stage || 'Ideation'} change="Current Phase" trend="neutral" />
            </div>

            {/* Recommended Next Steps */}
            <div style={{ marginBottom: 'var(--space-10)' }}>
                <h3 style={{ marginBottom: 'var(--space-1)', fontSize: '1.125rem', fontWeight: 600 }}>Recommended Next Steps</h3>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: 'var(--space-5)' }}>
                    AI-prioritized actions based on your current stage
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
                    <ActionCard
                        icon="plus"
                        title="Submit a New Idea"
                        description="Structured validation with AI frameworks"
                        onClick={() => setActiveTab('ideas')}
                    />
                    <ActionCard
                        icon="brain"
                        title="Consult AI Copilot"
                        description="Strategic guidance for your venture"
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

            {/* Your Ideas */}
            <div>
                <h3 style={{ marginBottom: 'var(--space-5)', fontSize: '1.125rem', fontWeight: 600 }}>Your Ideas</h3>
                {activeIdeasCount === 0 ? (
                    <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>No ideas yet. Start by submitting one!</p>
                        <button className="btn btn-primary" onClick={() => setActiveTab('ideas')}>Submit First Idea</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                        {ideas.slice(0, 3).map(idea => (
                            <IdeaCard
                                key={idea.id}
                                idea={idea}
                                onViewDetails={() => setActiveTab('ideas')}
                                onAnalyze={() => setActiveTab('copilot')}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function IdeasTab({ user, ideas, onRefresh }) {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [problem, setProblem] = useState('');
    const [solution, setSolution] = useState('');
    const [market, setMarket] = useState('');
    const [description, setDescription] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    title,
                    problem,
                    solution,
                    description,
                    market,
                    mediaUrl: mediaUrl || null
                })
            });

            const data = await response.json();

            if (data.success) {
                setShowForm(false);
                setTitle('');
                setProblem('');
                setSolution('');
                setMarket('');
                setDescription('');
                setMediaUrl('');
                if (onRefresh) onRefresh();
            } else {
                alert('Failed to create idea: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating idea:', error);
            alert('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    if (showForm) {
        return (
            <div className="card" style={{ padding: 'var(--space-8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Submit New Idea</h2>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Idea Title</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., AI-Powered Tutor"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Problem Statement</label>
                        <textarea
                            className="form-input"
                            placeholder="What problem are you solving?"
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                            rows={3}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Proposed Solution</label>
                        <textarea
                            className="form-input"
                            placeholder="How does your idea solve this?"
                            value={solution}
                            onChange={(e) => setSolution(e.target.value)}
                            rows={3}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Target Market</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., High school students in India"
                            value={market}
                            onChange={(e) => setMarket(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Demo Video / Pitch Deck URL (Required)</label>
                        <div style={{ marginBottom: 5, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            Upload your video to YouTube/Loom or deck to Drive, and paste the link here.
                        </div>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="https://..."
                            value={mediaUrl}
                            onChange={(e) => setMediaUrl(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Detailed Description</label>
                        <textarea
                            className="form-input"
                            placeholder="Any allowed extra details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Idea'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ marginBottom: 'var(--space-2)', fontSize: '1.75rem', fontWeight: 700 }}>Your Ideas</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Manage and validate your startup concepts</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <Icon name="plus" size={16} />
                        Submit New Idea
                    </button>
                </div>
            </div>

            {ideas.length === 0 ? (
                <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ marginBottom: 'var(--space-4)', color: 'var(--text-tertiary)' }}>
                        <Icon name="lightbulb" size={48} color="var(--text-disabled)" />
                    </div>
                    <h3 style={{ marginBottom: 'var(--space-2)', color: 'var(--text-secondary)' }}>No ideas yet</h3>
                    <p style={{ marginBottom: 'var(--space-6)', color: 'var(--text-tertiary)' }}>Got a startup idea? Add it here to get AI validation.</p>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>Submit First Idea</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    {ideas.map(idea => (
                        <IdeaCard key={idea.id} idea={idea} detailed />
                    ))}
                </div>
            )}
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
    const { user } = useAppContext();
    const [matches, setMatches] = useState([]);
    const [requests, setRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Fetch potential matches
            const matchRes = await fetch(`/api/matches?userId=${user.id}`);
            const matchData = await matchRes.json();
            if (matchData.success) {
                setMatches(matchData.matches);
            }

            // Fetch incoming and sent requests
            const reqRes = await fetch(`/api/matches/requests?userId=${user.id}`);
            const reqData = await reqRes.json();
            if (reqData.success) {
                setRequests(reqData.requests || []);
                setSentRequests(reqData.sent || []);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, [user.id]);

    const handleConnect = async (matchUserId) => {
        try {
            const res = await fetch('/api/matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, matchedUserId: matchUserId })
            });
            const data = await res.json();
            if (data.success) {
                alert('Request Sent Successfully! The user has been notified.');
                fetchData(); // Refresh immediately to update UI status
            } else {
                alert(data.error || 'Failed to send request');
            }
        } catch (e) {
            alert('Network error');
        }
    };

    const handleRespond = async (requestId, status) => {
        try {
            await fetch(`/api/matches/${requestId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchData();
        } catch (e) {
            console.error(e);
            alert('Failed to update status');
        }
    };


    if (loading) return <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-secondary)' }}>Finding ideal co-founders...</div>;

    return (
        <>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ marginBottom: 'var(--space-2)' }}>Co-Founder Matches</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Expand your network and find partners.</p>
            </div>

            {/* Incoming Requests Section */}
            {(requests.length > 0 || sentRequests.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 40 }}>

                    {requests.length > 0 && (
                        <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="bell" size={18} color="var(--brand-primary)" /> Incoming requests ({requests.length})
                            </h3>
                            {requests.map(req => (
                                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{req.sender?.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{req.sender?.role}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        <button className="btn btn-sm btn-primary" onClick={() => handleRespond(req.id, 'accepted')}><Icon name="check" size={14} /></button>
                                        <button className="btn btn-sm btn-outline" onClick={() => handleRespond(req.id, 'rejected')}><Icon name="x" size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {sentRequests.length > 0 && (
                        <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="send" size={18} color="#6b7280" /> Sent requests ({sentRequests.length})
                            </h3>
                            {sentRequests.map(req => (
                                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{req.receiver?.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Waiting for response...</div>
                                    </div>
                                    <span className="badge" style={{ background: '#f3f4f6', color: '#6b7280' }}>Pending</span>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            )}

            <h3 style={{ marginBottom: 'var(--space-4)', fontSize: '1.125rem', fontWeight: 700 }}>Suggested Matches</h3>

            {matches.length === 0 ? (
                <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                    <div style={{ marginBottom: 'var(--space-4)', color: 'var(--text-tertiary)' }}>
                        <Icon name="users" size={48} color="var(--text-disabled)" />
                    </div>
                    <p>No matches found yet. Try updating your profile with more skills!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
                    {matches.map(match => (
                        <CoFounderCard
                            key={match.id}
                            name={match.name}
                            role={match.role || 'Founder'}
                            stage={match.stage}
                            skills={match.skills || []}
                            location={match.location || 'Remote'}
                            match={match.match_score || 85}
                            status={match.connection_status}
                            onConnect={() => handleConnect(match.id)}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

function MessagesTab() {
    const { user } = useAppContext();
    const [connections, setConnections] = useState([]);
    const [selectedConnection, setSelectedConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = React.useRef(null);

    // Fetch Connections
    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const res = await fetch(`/api/connections?userId=${user.id}`);
                const data = await res.json();
                if (data.success) {
                    setConnections(data.connections);
                    if (data.connections.length > 0 && !selectedConnection) {
                        setSelectedConnection(data.connections[0]);
                    }
                }
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchConnections();
    }, [user.id]);

    // Fetch Messages when connection selected
    useEffect(() => {
        if (!selectedConnection) return;
        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/messages?connectionId=${selectedConnection.id}`);
                const data = await res.json();
                if (data.success) {
                    setMessages(data.messages);
                    scrollToBottom();
                }
            } catch (e) { console.error(e); }
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [selectedConnection]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConnection) return;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    connectionId: selectedConnection.id,
                    senderId: user.id,
                    content: newMessage
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessages([...messages, data.message]);
                setNewMessage('');
                scrollToBottom();
            }
        } catch (e) { console.error(e); }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, height: 'calc(100vh - 140px)' }}>

            {/* Connection List */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 15, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Messages</div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {connections.length === 0 ? (
                        <div style={{ padding: 20, color: '#9ca3af', textAlign: 'center', fontSize: '0.9rem' }}>No connections yet. Find co-founders to chat!</div>
                    ) : (
                        connections.map(conn => {
                            const partner = conn.partner;
                            const isActive = selectedConnection?.id === conn.id;
                            return (
                                <div
                                    key={conn.id}
                                    onClick={() => setSelectedConnection(conn)}
                                    style={{
                                        padding: 15,
                                        borderBottom: '1px solid #f3f4f6',
                                        cursor: 'pointer',
                                        background: isActive ? '#f0f9ff' : 'transparent',
                                        borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent'
                                    }}
                                >
                                    <div style={{ fontWeight: 600 }}>{partner?.name || 'User'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{partner?.role || 'Founder'}</div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {selectedConnection ? (
                    <>
                        <div style={{ padding: 15, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 'bold' }}>
                                {selectedConnection.partner?.name?.[0]}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>{selectedConnection.partner?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Co-Founder</div>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10, background: '#f9fafb' }}>
                            {messages.map(msg => {
                                const isMe = msg.sender_id === user.id;
                                return (
                                    <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                        <div style={{
                                            padding: '10px 15px',
                                            borderRadius: 12,
                                            background: isMe ? 'var(--brand-primary)' : '#fff',
                                            color: isMe ? '#fff' : '#1f2937',
                                            border: isMe ? 'none' : '1px solid #e5e7eb',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                        }}>
                                            {msg.content}
                                        </div>
                                        <div style={{ fontSize: '0.6rem', color: '#9ca3af', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} style={{ padding: 15, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10 }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
                                <Icon name="send" size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexDirection: 'column' }}>
                        <Icon name="message-square" size={48} color="#e5e7eb" />
                        <p style={{ marginTop: 20 }}>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>

        </div>
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

function IdeaCard({ idea, detailed, onViewDetails, onAnalyze }) {
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
                <div style={{ paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)' }}>

                    {idea.media_url && (
                        <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Icon name="rocket" size={16} color="var(--brand-primary)" />
                            <a href={idea.media_url} target="_blank" style={{ fontWeight: 600, color: 'var(--brand-primary)', textDecoration: 'none' }}>
                                View Demo / Pitch Deck
                            </a>
                        </div>
                    )}

                    <h5 style={{ marginBottom: 'var(--space-3)', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                        Community Feedback ({idea.validations?.length || 0})
                    </h5>

                    {idea.validations && idea.validations.length > 0 ? (
                        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                            {idea.validations.map((v, i) => (
                                <div key={i} style={{ padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <Icon name={v.vote_type === 'tick' ? 'check' : 'x'} size={14} color={v.vote_type === 'tick' ? 'var(--accent-success)' : '#ef4444'} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: v.vote_type === 'tick' ? 'var(--accent-success)' : '#ef4444', textTransform: 'uppercase' }}>
                                            {v.vote_type === 'tick' ? 'Validated' : 'Concerns'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>"{v.feedback}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                            No feedback yet. Your idea is waiting for validation!
                        </div>
                    )}
                </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: detailed ? 'none' : '1px solid var(--border-light)' }}>
                {!detailed && <button className="btn btn-sm btn-primary" onClick={onViewDetails}>View Details</button>}
                <button className="btn btn-sm btn-secondary" onClick={onAnalyze || (() => alert('Navigating to AI Copilot...'))}>AI Analysis</button>
            </div>
        </div>
    );
}

function CoFounderCard({ name, role, stage, skills, match, location, status, onConnect }) {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);

    return (
        <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                <div style={{
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--brand-primary)',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem'
                }}>
                    {match}% Match
                </div>
            </div>

            <h4 style={{ marginBottom: 'var(--space-1)' }}>{name}</h4>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>{role}</span>
                {stage && <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 4 }}>{stage}</span>}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>{location}</p>

            <div style={{ marginBottom: 'var(--space-4)', flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {skills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="badge" style={{
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
                    {skills.length > 4 && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', alignSelf: 'center' }}>+{skills.length - 4}</span>}
                </div>
            </div>

            {status === 'pending' ? (
                <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', cursor: 'default' }} disabled>
                    <Icon name="check" size={16} /> Request Sent
                </button>
            ) : status === 'accepted' ? (
                <button className="btn btn-outline" style={{ width: '100%', marginTop: 'auto', borderColor: 'var(--accent-success)', color: 'var(--accent-success)', cursor: 'default' }} disabled>
                    <Icon name="check" size={16} /> Connected
                </button>
            ) : (
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }} onClick={onConnect}>Connect</button>
            )}
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
        if (currentPage === 'profile-setup') return <ProfileSetupPage />;
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
