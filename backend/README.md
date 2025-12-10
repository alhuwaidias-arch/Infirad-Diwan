# Diwan Al-Maarifa Backend API

**ديوان المعرفة - منصة المعرفة العلمية العربية**

Production-ready REST API for the Arabic Knowledge Platform.

---

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup database:**
```bash
cd ../database
./setup_database.sh
```

4. **Start server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/change-password` - Change password
- `GET /api/users` - List users (admin)
- `GET /api/users/:id` - Get user (admin)
- `PUT /api/users/:id/role` - Update role (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Content
- `GET /api/content/published` - Get published content
- `GET /api/content/published/:slug` - Get by slug
- `GET /api/content/search` - Search content
- `POST /api/content/submit` - Submit content
- `GET /api/content/submissions` - Get submissions
- `GET /api/content/pending-reviews` - Get pending reviews (auditor)
- `POST /api/content/submissions/:id/review` - Submit review (auditor)
- `POST /api/content/submissions/:id/publish` - Publish (admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get by slug
- `POST /api/categories` - Create (admin)
- `PUT /api/categories/:id` - Update (admin)
- `DELETE /api/categories/:id` - Delete (admin)

---

## Architecture

```
backend/
├── src/
│   ├── index.js              # Server entry point
│   ├── controllers/          # Business logic
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth & validation
│   ├── services/             # Email & workflow
│   └── database/             # DB connection
├── package.json
└── .env
```

---

## Features

✅ JWT Authentication  
✅ Role-Based Access Control  
✅ Content Management Workflow  
✅ Email Notifications  
✅ Full-Text Search (Arabic)  
✅ Input Validation  
✅ Security Headers  
✅ PostgreSQL Integration  

---

## User Roles

- **Contributor** - Submit content
- **Content Auditor** - Review content quality
- **Technical Auditor** - Technical review
- **Admin** - Full system access

---

## Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run tests
npm run lint       # Lint code
npm run migrate    # Migrate existing content
```

---

## Environment Variables

See `.env.example` for all configuration options.

Required variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`
- `FRONTEND_URL`

Optional:
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` (for emails)

---

## Documentation

- [Backend Complete Guide](./BACKEND_COMPLETE.md)
- [API Test Results](./API_TEST_RESULTS.md)
- [Phase 2 Progress](./PHASE2_BACKEND_PROGRESS.md)

---

## Security

- Bcrypt password hashing
- JWT token authentication
- SQL injection protection
- Input validation
- Helmet security headers
- CORS configuration

---

## License

MIT

---

**Version**: 1.0.0  
**Status**: Production Ready ✅
