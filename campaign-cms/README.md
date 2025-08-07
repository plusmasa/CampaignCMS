# Campaign Management CMS

A custom-built Campaign Management Content Management System for managing marketing campaigns across multiple channels.

## Phase 1 - Basic Setup ✅
- Basic Node.js/Express server setup
- Project structure with frontend/backend separation  
- Hello World functionality
- Environment configuration

## Phase 2 - Database & API ✅
- SQLite database with Sequelize ORM
- Campaign model with full validation
- Complete CRUD API endpoints
- Database management tools
- Port separation (Backend: 3001, Frontend: 3000)
- Realistic seed data with 3 sample campaigns

## Project Structure

```
campaign-cms/
├── backend/
│   ├── server.js          # Express server
│   ├── models/            # Database models (Sequelize)
│   │   ├── Campaign.js    # Campaign model with validation
│   │   └── index.js       # Model exports
│   ├── routes/            # API route handlers
│   │   └── campaigns.js   # Campaign CRUD endpoints
│   ├── database/          # Database setup
│   │   ├── connection.js  # SQLite connection
│   │   └── init.js        # Database initialization & seeding
│   ├── data/              # SQLite database file
│   ├── reset-db.js        # Database reset utility
│   └── update-schedule-stop.js # Data migration script
├── frontend/
│   └── index.html         # Basic frontend for testing APIs
├── package.json           # Dependencies and NPM scripts
├── .env.example          # Environment template
├── .env                  # Environment config
└── .gitignore           # Git ignore rules
```

## Getting Started

1. Install dependencies: `npm install`
2. Start the backend API: `npm start` (runs on http://localhost:3001)
3. Start the frontend: `npm run frontend` (runs on http://localhost:3000)
4. Or run both: `npm run dev:full`

### API Endpoints
- **GET** `/api/health` - API health check
- **GET** `/api/db-health` - Database connectivity check  
- **GET** `/api/campaigns` - List all campaigns
- **GET** `/api/campaigns/:id` - Get specific campaign
- **POST** `/api/campaigns` - Create new campaign
- **PUT** `/api/campaigns/:id` - Update campaign
- **DELETE** `/api/campaigns/:id` - Delete campaign

## Development

- `npm start` - Start backend API server (port 3001)
- `npm run dev` - Start backend with auto-reload
- `npm run frontend` - Start frontend server (port 3000)
- `npm run dev:full` - Start both frontend and backend
- `npm run reset-db` - Reset and re-seed database

## Current Status

- ✅ Phase 1: Project scaffolding and basic setup
- ✅ Phase 2: Database setup, models, and API endpoints
- ⏳ Phase 3: Enhanced API features and validation  
- ⏳ Phase 4: Frontend React setup
- ⏳ Phase 5: Campaign CRUD operations UI
- ⏳ Phase 6: Workflow management
- ⏳ Phase 7: Testing and validation
- ⏳ Phase 8: Documentation and deployment prep
- ⏳ Phase 9: Final deployment

## Database

**Sample Data**: 3 campaigns with different states:
- **Summer Sale 2025** (Draft) - Email + BNP, US/CA markets
- **Back to School Campaign** (Scheduled) - Email + Rewards Dashboard, All markets  
- **Holiday Preview** (Live) - BNP + Rewards Dashboard, US/UK/CA markets (indefinite end date)

---

Built with Node.js, Express, Sequelize, and SQLite
