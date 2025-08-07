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
**React with Microsoft Fluent 2**
- Component-based architecture perfect for enterprise CMS applications
- Fluent UI React v9 provides professional UI components designed for productivity tools
- Modern design system with enterprise-focused components (DataGrid, Forms, Navigation)
- Built with TypeScript and modern React patterns
- Responsive design and accessibility built-in
- Easily deployable to Codespaces

### Database
**SQLite for Local Development**
- Zero configuration needed for local development
- Single file database that's easy to manage
- Can easily migrate to PostgreSQL or MySQL later
- Direct file access works well in both local and Codespaces environments

### CMS Framework
**Custom Implementation using React + Express**
- React frontend with Microsoft Fluent 2 design system
- Professional enterprise UI components (DataGrid, Dialog, Forms, Navigation)
- More flexible and lighter weight than full CMS platforms like WordPress or Drupal
- Full control over features and UI with modern design language
- TypeScript-first approach for better maintainability

### Local Development Server
**Express.js Server with Port Management**
- **Backend API**: Port 3001 (Express.js server with database and API endpoints)
- **Frontend Development**: Port 3000 (React + Vite dev server with hot module replacement)
- **Production Frontend**: Served from Backend on Port 3001 (static files from ../frontend)
- Environment variables for configuration management
- Concurrent development workflow using concurrently package

**Port Configuration Summary:**
- Development: Backend (3001) + Frontend Dev Server (3000) running simultaneously
- Production: Backend (3001) serves both API and static frontend files
- Frontend makes API calls to `http://localhost:3001/api/*` in both modes

### Configuration Management
**Environment Variables with dotenv**
- `.env` files for local development settings
- Frontend-specific `.env` configuration with `VITE_` prefix
- Automatic Codespaces environment detection and configuration
- Dynamic CORS and API URL handling for different deployment scenarios
- Separate environment files for development, Codespaces, and future production

**Environment Configuration Structure:**
- Backend: `campaign-cms/.env` (Node.js environment variables)
- Frontend: `campaign-cms/frontend/.env` (Vite environment variables with `VITE_` prefix)
- Codespaces: `.devcontainer/` configuration with automatic setup script
- Templates: `.env.example` files for easy environment setup

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
├── frontend/             # React application with Fluent 2
│   ├── public/           # Static assets and HTML template
│   ├── src/              # React source code
│   │   ├── components/   # Reusable UI components
│   │   │   ├── common/   # Shared components (Header, Nav, etc.)
│   │   │   ├── campaigns/ # Campaign-specific components
│   │   │   └── forms/    # Form components
│   │   ├── pages/        # Page components
│   │   │   ├── Dashboard.tsx # Main campaign dashboard
│   │   │   ├── CampaignDetail.tsx # Campaign editing
│   │   │   └── Reports.tsx # Reporting page
│   │   ├── services/     # API service functions
│   │   ├── types/        # TypeScript type definitions
│   │   ├── utils/        # Frontend utility functions
│   │   ├── App.tsx       # Main App component
│   │   └── main.tsx      # React entry point
│   ├── vite.config.ts    # Vite configuration
│   └── package.json      # Frontend dependencies
├── tests/               # Comprehensive test suite
│   ├── unit/            # Unit tests for utilities
│   ├── integration/     # API integration tests
│   ├── frontend/        # React component tests
│   └── fixtures/        # Test data and mocks
├── package.json         # Root dependencies and scripts
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

**Frontend Dependencies:**
- `react` - React library for building user interfaces
- `react-dom` - React DOM renderer
- `@fluentui/react-components` - Microsoft Fluent 2 UI components
- `@fluentui/react-icons` - Fluent 2 icon library
- `typescript` - TypeScript for type safety
- `vite` - Modern build tool for React development

**Testing and Code Quality:**
- `jest` - JavaScript testing framework
- `supertest` - HTTP assertion library for testing APIs
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM testing
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
1. Start with a minimal Express.js server for API endpoints ✅ Complete
2. Implement SQLite database for campaign storage ✅ Complete
3. Create professional backend utilities and testing ✅ Complete  
4. Create React frontend with Microsoft Fluent 2 components
5. Implement TypeScript interfaces for type safety
6. Build responsive campaign dashboard with DataGrid
7. Create campaign editing forms with Fluent form components
8. Add comprehensive frontend testing with React Testing Library
9. Implement environment-based configuration for seamless transition between local and Codespaces
10. Add authentication/authorization in later phases

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

### Development Workflow

### NPM Scripts and Directory Context
**Root Directory Scripts** (`/campaign-cms/`):
- `npm start` - Start production server (backend on port 3001, serves frontend static files)
- `npm run dev` - Start backend development server with auto-reload (port 3001)
- `npm run frontend` - Start React frontend development server (port 3000, Vite)
- `npm run dev:full` - **RECOMMENDED**: Start both backend and frontend concurrently
- `npm run build` - Build React frontend for production (outputs to ../dist)
- `npm run preview` - Preview production build locally
- `npm run reset-db` - Reset and re-seed database
- `npm test` - Run comprehensive backend test suite (Jest + Supertest)
- `npm run test:watch` - Run tests in watch mode for development
- `npm run test:coverage` - Run tests with code coverage analysis
- `npm run test:frontend` - Run React component tests (delegates to frontend/)
- `npm run lint` - Run ESLint code quality checks
- `npm run type-check` - Run TypeScript type checking (delegates to frontend/)

**Frontend Directory Scripts** (`/campaign-cms/frontend/`):
- `npm run dev` - Start Vite development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run React component tests
- `npm run type-check` - TypeScript type checking

**Development Mode Workflow:**
1. Run `npm run dev:full` from `/campaign-cms/` directory
2. Backend API starts on `http://localhost:3001`
3. Frontend dev server starts on `http://localhost:3000`
4. Frontend automatically proxies API calls to backend
5. Both servers support hot reload for development

### Frontend Development Stack
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: React 18+ with TypeScript
- **Design System**: Microsoft Fluent 2 (Fluent UI React v9)
- **Styling**: CSS-in-JS with Griffel (Fluent's styling engine)
- **State Management**: React hooks and context (expandable to Redux if needed)
- **Testing**: React Testing Library with Jest
- **Type Safety**: TypeScript throughout the frontend codebase

### Code Quality and Testing
- **Testing Framework**: Jest with Supertest for API testing, React Testing Library for components
- **Coverage Target**: 80% minimum code coverage threshold
- **Code Quality**: ESLint with TypeScript and React configurations
- **Architecture**: DRY principles with shared utility modules
- **Logging**: Structured logging with environment-aware output
- **Error Handling**: Comprehensive async error handling and validation
- **Type Safety**: TypeScript for both frontend and backend interfaces

### Port Configuration
- **Backend API**: http://localhost:3001
- **Frontend Development**: http://localhost:3000 (Vite dev server)
- **Frontend Production**: http://localhost:3001 (served by backend)
- **Environment Variables**: Configured via .env file

**API Base URL Configuration:**
- Development: Frontend calls `http://localhost:3001/api/*`
- Production: Frontend calls `/api/*` (same origin)

### Database Management
- SQLite database stored in `backend/data/campaign_cms.sqlite`
- Automatic initialization and seeding on first run
- Reset script available for clean development state

## Deployment Considerations

### Local Development
- Uses SQLite database stored in `backend/data/campaign_cms.sqlite`
- Backend runs on port 3001, frontend dev server on port 3000
- Environment configured via `campaign-cms/.env` and `campaign-cms/frontend/.env`
- CORS configured for `http://localhost:3000` origin

### GitHub Codespaces Deployment  
- Automatic environment detection via `CODESPACE_NAME` environment variable
- Dynamic CORS configuration allowing Codespaces forwarded port domains
- Automatic port forwarding for 3000 (frontend) and 3001 (backend)
- Pre-configured `.devcontainer/devcontainer.json` with Node.js 18 environment
- Setup script `setup-codespaces.sh` automatically configures environment variables
- Vite proxy configuration handles API routing in development mode

**Codespaces Setup Process:**
1. Codespace automatically runs `postCreateCommand` to install dependencies
2. Run `./setup-codespaces.sh` to configure environment variables (optional - auto-detected)
3. Use `npm run dev:full` to start both servers
4. Access via forwarded ports: frontend (3000) and backend (3001)

### Future Production Deployment
- Can easily migrate to PostgreSQL by updating `DATABASE_URL` environment variable  
- Environment-based configuration supports multiple deployment targets
- CORS and API URL configuration adapts to deployment environment
- Built-in health check endpoints for monitoring and load balancer integration

## Common Development Patterns and Troubleshooting

### Project Structure Notes
- **Two package.json files**: Root (`/campaign-cms/`) and Frontend (`/campaign-cms/frontend/`)
- **Root package.json**: Contains backend dependencies and orchestration scripts
- **Frontend package.json**: Contains React dependencies and Vite configuration
- **Always run main commands from root directory** (`/campaign-cms/`) for full-stack development

### Development Server Management
- **Single Command**: Use `npm run dev:full` from root for both servers
- **Separate Commands**: 
  - Backend only: `npm run dev` from root
  - Frontend only: `npm run frontend` from root or `npm run dev` from frontend/
- **Production**: `npm start` from root serves both API and frontend on port 3001

### Port and API Configuration
- **Development**: Frontend (3000) → Backend API (3001)
- **Production**: Frontend (3001) → Backend API (3001, same origin)
- **CORS**: Configured in backend for development cross-origin requests
- **API Proxy**: Vite automatically handles API calls during development

### Common Issues and Solutions
1. **"EADDRINUSE" errors**: Check for existing servers on ports 3000/3001
2. **API calls failing**: Ensure backend is running on port 3001
3. **Frontend not updating**: Check that Vite dev server is running on port 3000
4. **Package installation issues**: Run `npm install` in both root and frontend/ directories
5. **TypeScript errors**: Run `npm run type-check` from root directory
6. **CORS errors in Codespaces**: Ensure environment variables are configured correctly
7. **Environment variable not loading**: Check `.env` file exists and variables have correct prefix (`VITE_` for frontend)
8. **Codespaces port forwarding issues**: Use the automatically generated URLs from the Ports panel

### Environment Setup Commands
```bash
# Local Development Setup
cp .env.example .env
cp frontend/.env.example frontend/.env

# Codespaces Setup (automatic or manual)
./setup-codespaces.sh

# Start Development Servers
npm run dev:full    # Both backend and frontend
npm run dev         # Backend only  
npm run frontend    # Frontend only
```
