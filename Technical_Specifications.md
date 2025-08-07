# Technical Specifications for Campaign Management CMS

## Overview
Based on the requirements in our PRD, this document outlines the technical stack and architecture for the Campaign Management CMS that will work well locally and can easily transition to GitHub Codespaces.

## Tech Stack

### Backend
**Node.js with Express.js**
- Lightweight, fast, and great ecosystem
- Easy deployment to Codespaces
- RESTful API capabilities for campaign management
- npm ecosystem for easy package management

### Frontend
**React with Material-UI**
- Component-based architecture perfect for a CMS
- Material-UI provides pre-built UI components that match typical CMS experiences
- Responsive design out of the box
- Easily deployable to Codespaces

### Database
**SQLite for Local Development**
- Zero configuration needed for local development
- Single file database that's easy to manage
- Can easily migrate to PostgreSQL or MySQL later
- Direct file access works well in both local and Codespaces environments

### CMS Framework
**Custom Implementation using React + Express**
- Rather than using a heavy CMS framework, we'll build specifically for our campaign needs
- More flexible and lighter weight than full CMS platforms like WordPress or Drupal
- Full control over features and UI

### Local Development Server
**Express.js Server with Port Management**
- Backend API: Port 3001 (Express.js server with database and API endpoints)
- Frontend: Port 3000 (Static files served via http-server for development)
- Environment variables for configuration management
- Concurrent development workflow using concurrently package

### Configuration Management
**Environment Variables with dotenv**
- `.env` files for local settings
- Easy transition to Codespaces using the same pattern
- Different configurations for local vs. remote environments

## Project Structure
```
/campaign-cms
├── backend/               # Node.js/Express API server
│   ├── server.js         # Main server file
│   ├── models/           # Database models (Sequelize)
│   │   ├── Campaign.js   # Campaign model definition
│   │   └── index.js      # Models index and associations
│   ├── routes/           # API route handlers
│   │   ├── campaigns.js  # Campaign CRUD operations
│   │   ├── campaign-workflow.js # State management
│   │   ├── channel-management.js # Channel configurations
│   │   └── reports.js    # Reporting endpoints
│   ├── utils/            # Shared utilities (DRY compliance)
│   │   ├── responses.js  # Standardized API responses
│   │   ├── validation.js # Centralized validation logic
│   │   ├── constants.js  # Valid values and configs
│   │   ├── logger.js     # Structured logging system
│   │   └── middleware.js # Reusable middleware functions
│   ├── database/         # Database connection and initialization
│   │   ├── connection.js # Database connection setup
│   │   └── init.js       # Database initialization
│   ├── data/            # SQLite database file
│   │   └── campaign_cms.sqlite # Main database
│   ├── reset-db.js      # Database reset utility
│   └── update-schedule-stop.js # Utility scripts
├── frontend/             # Static HTML/CSS/JS (Phase 1-2)
│   └── index.html       # Simple frontend for testing
├── tests/               # Comprehensive test suite
│   ├── unit/            # Unit tests for utilities
│   ├── integration/     # API integration tests
│   └── fixtures/        # Test data and mocks
├── package.json         # Dependencies and scripts
├── jest.config.json     # Jest testing configuration
├── .env                 # Environment configuration
└── .env.example        # Environment template
```

### Development Dependencies and Production Stack

**Core Backend Dependencies:**
- `express` - Web framework for Node.js
- `sequelize` - Promise-based ORM for SQL databases
- `sqlite3` - SQLite database driver
- `cors` - Cross-Origin Resource Sharing middleware
- `dotenv` - Environment variable management
- `concurrently` - Run multiple commands concurrently

**Testing and Code Quality:**
- `jest` - JavaScript testing framework
- `supertest` - HTTP assertion library for testing APIs
- `eslint` - JavaScript linting utility
- `prettier` - Code formatter

**Production Utilities:**
- `winston` - Professional logging library
- `joi` - Schema validation for JavaScript objects
- `helmet` - Security middleware for Express
- `express-rate-limit` - Rate limiting middleware

## Key Benefits of This Stack
1. **Easy Local Development**: Node.js and SQLite require minimal setup
2. **Codespaces Ready**: All tools work identically in Codespaces
3. **Scalable**: Can upgrade to PostgreSQL/MySQL and add more servers when needed
4. **Familiar Technologies**: Well-documented and large community support
5. **Cross-Platform**: Works on macOS, Windows, and Linux
6. **Professional Quality**: Comprehensive testing, DRY principles, structured logging
7. **Maintainable**: Clean architecture with shared utilities and error handling

## Development Approach
1. Start with a minimal Express.js server for API endpoints
2. Implement SQLite database for campaign storage
3. Create React frontend with Material-UI components
4. Implement environment-based configuration for seamless transition between local and Codespaces
5. Add authentication/authorization in later phases

## API Endpoints

### Core Campaign Management
- `GET /api/health` - API health check
- `GET /api/db-health` - Database health check
- `GET /api/campaigns` - Get all campaigns with filtering, sorting, and pagination
- `GET /api/campaigns/:id` - Get specific campaign details
- `POST /api/campaigns` - Create new campaign (Draft state only)
- `PUT /api/campaigns/:id` - Update campaign (with state validation)
- `DELETE /api/campaigns/:id` - Delete campaign (Draft state only)

### Campaign Workflow Management
- `PUT /api/campaigns/:id/workflow` - Transition campaign state (Draft → Scheduled → Live → Complete)
- `GET /api/campaigns/:id/workflow/history` - Get state transition history
- `POST /api/campaigns/:id/schedule` - Schedule campaign with validation
- `POST /api/campaigns/:id/stop` - Stop live campaign

### Channel Management
- `GET /api/channels` - Get available channels and their configurations
- `GET /api/channels/:channel/config` - Get specific channel configuration schema
- `PUT /api/campaigns/:id/channels/:channel` - Update channel-specific configuration
- `GET /api/campaigns/:id/channels/:channel/preview` - Preview channel content

### Reporting (Future Implementation)
- `GET /api/campaigns/:id/reports` - Get campaign performance reports
- `GET /api/campaigns/:id/reports/:channel` - Get channel-specific reports
- `POST /api/campaigns/:id/reports/generate` - Generate new report

## Database Schema
### Campaigns Table
- `id` (Primary Key, Auto-increment)
- `title` (String, Required)
- `state` (Enum: Draft/Scheduled/Live/Complete)
- `startDate` (DateTime, Optional - set when published/scheduled)
- `endDate` (DateTime, Optional - null means indefinite duration)
- `channels` (JSON Array: Email, BNP, Rewards Dashboard)
- `markets` (JSON: "all" or array of market codes)
- `channelConfig` (JSON: Channel-specific configurations)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Note**: Channel-specific timing (individual email send dates, banner display periods) will be implemented in a future phase as separate tables or extended JSON schema.

### Reports Table (Future Implementation)
- `id` (Primary Key)
- `campaignId` (Foreign Key)
- `channel` (String)
- `metrics` (JSON)
- `generatedDate` (DateTime)

## Development Workflow

### NPM Scripts
- `npm start` - Start production server (backend on port 3001)
- `npm run dev` - Start development server with auto-reload
- `npm run frontend` - Start frontend development server (port 3000)
- `npm run dev:full` - Start both backend and frontend concurrently
- `npm run reset-db` - Reset and re-seed database
- `npm test` - Run comprehensive test suite (Jest + Supertest)
- `npm run test:watch` - Run tests in watch mode for development
- `npm run test:coverage` - Run tests with code coverage analysis
- `npm run lint` - Run ESLint code quality checks

### Code Quality and Testing
- **Testing Framework**: Jest with Supertest for API testing
- **Coverage Target**: 80% minimum code coverage threshold
- **Code Quality**: ESLint with professional configuration
- **Architecture**: DRY principles with shared utility modules
- **Logging**: Structured logging with environment-aware output
- **Error Handling**: Comprehensive async error handling and validation

### Port Configuration
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:3000 (development)
- **Environment Variables**: Configured via .env file

### Database Management
- SQLite database stored in `backend/data/campaign_cms.sqlite`
- Automatic initialization and seeding on first run
- Reset script available for clean development state

## Deployment Considerations
1. Local development uses SQLite and local Node.js server
2. Codespaces deployment uses the same codebase with environment-specific configurations
3. Future production deployment can use PostgreSQL with minimal code changes
