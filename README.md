# FoundryAI - Entrepreneurship Operating System

A professional platform combining AI validation, co-founder matching, and strategic guidance for Indian entrepreneurs.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

Follow the detailed guide in **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

Quick steps:
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run `database/schema.sql` in the Supabase SQL Editor
3. Copy your project URL and anon key
4. Update `.env` file

### 3. Configure Environment

```bash
cp .env.example .env
```

Then edit `.env` with your Supabase credentials:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the Application

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
FoundryAI/
├── public/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── style.css       # Professional light theme CSS
│   └── js/
│       └── app.jsx         # React application
├── database/
│   └── schema.sql          # Supabase database schema
├── config/
│   └── supabase.js         # Supabase client config
├── server.js               # Express backend with Supabase
├── package.json
└── .env                    # Environment variables
```

## ✨ Features

### For Founders

- ✅ **AI-Powered Idea Validation** - Get instant market analysis and viability scores
- ✅ **Co-Founder Matching** - Find ideal partners with ML-powered compatibility scoring
- ✅ **Founder Dashboard** - Track your progress from ideation to MVP
- ✅ **Founder Status** - See current focus, blockers, and suggested actions
- ✅ **Strategic Guidance** - YC-style questioning and personalized roadmaps
- ✅ **Resources Library** - Curated learning materials for Indian startups

### Technical Features

- ✅ **Supabase Backend** - Scalable PostgreSQL database with RLS
- ✅ **Real-time Updates** - Live data synchronization
- ✅ **Secure Authentication** - Email/password with Supabase Auth
- ✅ **Row Level Security** - Data isolation per user
- ✅ **Professional UI** - Clean light theme enterprise design
- ✅ **Responsive Design** - Works on all devices

## 🗄️ Database Schema

### Tables

- `users` - User profiles and authentication
- `ideas` - Startup ideas with AI validation
- `cofounder_matches` - Co-founder matching system
- `copilot_conversations` - AI copilot chat history
- `founder_status` - Current founder progress tracking
- `resources` - Learning materials and guides

See `database/schema.sql` for complete schema.

## 🔐 Security

- **Row Level Security (RLS)** enabled on all tables
- **Password hashing** with bcrypt
- **JWT tokens** for session management
- **Input validation** on all endpoints
- **HTTPS required** in production

## 🛠️ Development

### Available Scripts

- `npm start` - Start the development server
- `npm run dev` - Start with nodemon (auto-restart)
- `npm test` - Run tests (to be implemented)

### Environment Variables

```bash
PORT=3000                                           # Server port
JWT_SECRET=your_secret_key                          # JWT signing key
NODE_ENV=development                                # Environment
SUPABASE_URL=https://xxx.supabase.co               # Supabase project URL
SUPABASE_ANON_KEY=xxx                              # Supabase anon key
```

## 🚢 Deployment

### Deploy to Vercel

```bash
vercel deploy
```

### Deploy to Railway

```bash
railway up
```

### Environment Variables for Production

Make sure to set:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET` (strong random value)
- `NODE_ENV=production`

## 📚 API Documentation

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in

### Ideas

- `POST /api/ideas` - Submit new idea
- `GET /api/ideas` - Get all ideas
- `GET /api/ideas/:id` - Get specific idea

### Founder Status

- `GET /api/founder-status/:userId` - Get founder status
- `PUT /api/founder-status/:userId` - Update status

### Co-Founder Matching

- `GET /api/matches` - Get potential matches
- `POST /api/matches` - Create match request

### Resources

- `GET /api/resources` - Get learning resources

### AI Copilot

- `POST /api/copilot/chat` - Chat with AI copilot

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- 📧 Email: support@foundryai.com
- 💬 Discord: [Join our community](#)
- 📖 Docs: [Full documentation](#)

## 🎯 Roadmap

- [ ] Real AI integration (OpenAI/Anthropic)
- [ ] ML-based co-founder matching algorithm
- [ ] Pitch deck generator
- [ ] Investor connection platform
- [ ] Mobile app (React Native)
- [ ] WhatsApp bot integration

---

Built with ❤️ for Indian entrepreneurs
