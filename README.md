# ديوان المعرفة | Diwan Al-Maarifa

**Arabic Knowledge Platform** - منصة المعرفة العلمية العربية

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-in%20development-yellow.svg)]()

---

## 🌟 Overview

**Diwan Al-Maarifa** (ديوان المعرفة) is an enterprise-grade Arabic knowledge platform designed to provide high-quality scientific content in Arabic. The platform features AI-powered content review, multi-stage approval workflows, and advanced search capabilities.

### Key Features

- 📚 **Comprehensive Content** - Scientific terms and articles in Arabic
- 🤖 **AI-Powered Review** - Automated content quality analysis and Arabic language checking
- 👥 **Multi-Stage Workflow** - Content → AI Review → Content Auditor → Technical Auditor → Published
- 🔍 **Advanced Search** - Full-text search with Arabic language support
- 📊 **Analytics** - User engagement and content performance tracking
- 🔐 **Secure** - Role-based access control and audit trails

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Database** | PostgreSQL 14+ | Data storage with full-text search |
| **Backend** | Node.js + Express | RESTful API server |
| **Frontend** | React + TypeScript | User interface (coming soon) |
| **AI Service** | Python + OpenAI | Content analysis and review |
| **Styling** | TailwindCSS | Responsive UI design |
| **Auth** | JWT | Authentication and authorization |

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    CDN (Cloudflare)                      │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│                   Load Balancer                          │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼───────┐ ┌─────▼─────┐ ┌───────▼────────┐
│  Frontend     │ │  API       │ │  AI Agent      │
│  (React)      │ │  (Express) │ │  (Python)      │
└───────────────┘ └─────┬─────┘ └───────┬────────┘
                        │                │
        ┌───────────────┼────────────────┤
        │               │                │
┌───────▼───────┐ ┌────▼────┐ ┌────────▼────────┐
│  PostgreSQL   │ │  Redis  │ │  Elasticsearch  │
└───────────────┘ └─────────┘ └─────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **PostgreSQL** 14 or higher
- **Node.js** 18 or higher
- **npm** or **pnpm**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alhuwaidias-arch/Diwan-Al-Maarifa.git
   cd Diwan-Al-Maarifa
   ```

2. **Setup database**
   ```bash
   cd database
   ./setup_database.sh
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```
Diwan-Al-Maarifa/
├── database/                    # Database schema and migrations
│   ├── schema/                  # SQL schema files
│   ├── migrations/              # Database migrations
│   ├── seeds/                   # Seed data
│   └── setup_database.sh        # Setup script
│
├── backend/                     # Node.js backend API
│   ├── src/                     # Source code
│   ├── config/                  # Configuration files
│   ├── tests/                   # Test files
│   └── package.json
│
├── frontend/                    # React frontend (coming soon)
├── ai-agent/                    # AI service (coming soon)
├── docs/                        # Documentation
│
├── .env.example                 # Environment template
├── .gitignore
└── README.md
```

---

## 📊 Database Schema

The platform uses PostgreSQL with 9 core tables:

- **users** - User accounts and authentication
- **categories** - Scientific categories
- **content_submissions** - Content workflow management
- **published_content** - Published content with search
- **workflow_history** - Audit trail
- **notifications** - User notifications
- **analytics_events** - Usage tracking
- **comments** - User engagement
- **user_sessions** - Session management

---

## 🔄 Content Workflow

```
Submission → AI Review → Content Auditor → Technical Auditor → Published
```

Each stage includes:
- Status tracking
- Reviewer assignment
- Review notes and scores
- Timestamps
- Complete audit trail

---

## 🛠️ Development

### Running Tests
```bash
cd backend
npm test
```

### Database Migrations
```bash
npm run db:migrate
```

### Linting
```bash
npm run lint
```

---

## 📖 Documentation

- [Architecture Document](diwan-platform-architecture.md)
- [Phase 1 Deliverables](PHASE1_DELIVERABLES_REVIEW.md)
- [Database Documentation](database/README.md) *(coming soon)*
- [API Documentation](docs/api/) *(coming soon)*

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅ COMPLETED
- Database schema design
- Setup scripts and configuration
- Project structure

### Phase 2: Backend API 🔄 IN PROGRESS
- Express server setup
- Authentication system
- Content management API
- Workflow routing

### Phase 3: AI Agent 📋 PLANNED
- Content quality analyzer
- Arabic language checker
- Duplicate detection
- Workflow automation

### Phase 4: Frontend 📋 PLANNED
- React application
- User dashboards
- Admin panel

### Phase 5: Testing & Optimization 📋 PLANNED
- Comprehensive testing
- Performance optimization
- Security audit

### Phase 6: Deployment 📋 PLANNED
- Production deployment
- CI/CD pipeline
- Monitoring setup

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Diwan Al-Maarifa Development Team**

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**© 2025 ديوان المعرفة. All rights reserved.**
