# Campaign Management CMS

A professional full-stack campaign management system with Node.js/Express backend and React/TypeScript frontend using Microsoft Fluent 2 design system.

## 🚀 Current Status

**Phase 4 Complete**: Frontend Dashboard Development ✅
- ✅ **Backend API**: Complete CRUD operations with comprehensive testing
- ✅ **Frontend Dashboard**: Professional React UI with Microsoft Fluent 2
- ✅ **Campaign Management**: Full create, read, delete operations with validation
- ✅ **Search & Filtering**: Real-time client-side search across all campaign data
- ✅ **Professional UI**: Enterprise-grade interface with TypeScript integration
- 🔄 **Next**: Ready for Phase 5 - Advanced Features and Campaign Editing

## 📊 Key Metrics

| Metric | Status |
|--------|---------|
| **Backend Endpoints** | 15+ complete REST API endpoints |
| **Test Coverage** | 33 tests, all passing ✅ |
| **Frontend Components** | Professional React components with Fluent 2 |
| **Search Functionality** | Real-time filtering across all campaign data |
| **Type Safety** | Full TypeScript integration |
| **Architecture** | Clean separation of concerns, DRY compliant |

## 🏗️ Architecture

### Full-Stack Structure
```
campaign-cms/
├── backend/          # Node.js/Express API server
│   ├── routes/       # API endpoints (campaigns, workflow, channels, reports)
│   ├── models/       # Database models (Sequelize ORM)
│   ├── utils/        # Shared utilities (responses, validation, logging)
│   ├── database/     # Connection and initialization
│   └── data/         # SQLite database
├── frontend/         # React/TypeScript dashboard
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components (Dashboard)
│   │   ├── services/   # API client services
│   │   ├── types/      # TypeScript type definitions
│   │   └── constants/  # Frontend constants
│   └── public/       # Static assets
└── tests/           # Comprehensive test suite
```

### Frontend Architecture (Phase 4 ✅)
- **React 18+ with TypeScript**: Full type safety and modern React patterns
- **Microsoft Fluent 2**: Enterprise design system with professional components
- **Vite Build Tool**: Fast development and optimized production builds
- **Client-Side Search**: Real-time filtering across all campaign data
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Utilities (DRY Compliance)
- **responses.js**: Standardized API response formatting
- **validation.js**: Centralized input validation logic
- **constants.js**: Single source of truth for valid values
- **logger.js**: Structured logging with environment awareness
- **middleware.js**: Reusable middleware functions

## 🔧 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation & Setup
```bash
# Install all dependencies (backend + frontend)
npm install
cd frontend && npm install && cd ..

# Initialize database
npm run reset-db

# Start full development environment
npm run dev:full
```

### Development Servers
- **Backend**: http://localhost:3001 (API server)
- **Frontend**: http://localhost:3000 (React dev server)
- **Full Stack**: `npm run dev:full` runs both servers concurrently

### Available Scripts
- `npm run dev:full` - **Recommended**: Start both backend and frontend
- `npm run dev` - Backend development server only
- `npm run frontend` - Frontend development server only
- `npm start` - Production server (backend serves frontend)
- `npm test` - Run comprehensive backend test suite
- `npm run test:coverage` - Run tests with coverage analysis
- `npm run reset-db` - Reset and seed database

## 📡 API Endpoints

### Campaign Management
- `GET /api/campaigns` - List campaigns (with filtering & pagination)
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign (Draft only)

### Campaign Workflow
- `PUT /api/campaigns/:id/workflow` - Transition campaign state
- `POST /api/campaigns/:id/schedule` - Schedule campaign
- `POST /api/campaigns/:id/stop` - Stop live campaign

### Channel Management
- `GET /api/channels` - Get available channels
- `GET /api/channels/:channel/config` - Get channel configuration
- `PUT /api/campaigns/:id/channels/:channel` - Update channel config

### Health & Reports
- `GET /api/health` - API health check
- `GET /api/db-health` - Database connectivity check
- `GET /api/campaigns/:id/reports` - Get campaign reports (future)

## 🎨 Frontend Features (Phase 4 Complete)

### Dashboard Interface
- **Campaign Listing**: Professional DataGrid with sorting and filtering
- **Real-Time Search**: Instant search across titles, states, channels, markets, and dates
- **State Filtering**: Filter campaigns by Draft, Scheduled, Live, or Complete status
- **Visual Indicators**: Color-coded badges for campaign states
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### Campaign Management
- **Create Campaign**: Modal dialog with form validation
- **Delete Campaign**: Confirmation dialog with safety checks (Draft only)
- **Campaign Preview**: Detailed campaign information display
- **Error Handling**: User-friendly error messages and loading states

### Technical Features
- **TypeScript Integration**: Full type safety across the application
- **Microsoft Fluent 2**: Professional enterprise design components
- **Client-Side Performance**: Instant search and filtering without API calls
- **Modern React Patterns**: Hooks, context, and functional components

## 🧪 Testing

### Test Structure
```
tests/
├── unit/             # Unit tests for utilities and models
├── integration/      # API endpoint integration tests
└── fixtures/         # Test data and mocks
```

### Running Tests
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage analysis
npm run test:coverage

# Run specific test files
npm test -- campaigns.test.js
```

## 🛠️ Development

### Code Quality Standards
- ✅ **DRY Principles**: No code duplication
- ✅ **Professional Error Handling**: Structured error responses
- ✅ **Comprehensive Testing**: Unit and integration tests
- ✅ **Structured Logging**: Environment-aware logging with context
- ✅ **Input Validation**: Centralized validation with clear error messages

### Database Schema
**Campaigns Table**: Core campaign entity with JSON fields for flexible channel/market configuration
- `id`, `title`, `state`, `startDate`, `endDate`
- `channels` (JSON), `markets` (JSON), `channelConfig` (JSON)
- Automatic timestamps and validation

### Channel Support
- **Email**: Marketing email campaigns
- **BNP** (Branded Network Partners): Partner channel promotions  
- **Rewards Dashboard**: Customer rewards program integration

### Market Support
- Global campaigns (`"all"`) or specific market targeting
- Extensible market configuration system

## 🔒 Security & Performance

- ✅ Input validation and sanitization
- ✅ CORS configuration for cross-origin requests
- ✅ Structured error handling (no sensitive data leaks)
- ✅ Environment-based configuration
- ✅ Database query optimization with Sequelize ORM

## 📚 Documentation

- **Project Overview**: See `../PRD_Campaign_Management_CMS.md`
- **Development Phases**: See `../Project_Phases.md`
- **Technical Specifications**: See `../Technical_Specifications.md`
- **Best Practices**: See `../BestPractices.md`
- **Getting Started**: See `../StartHere.md`

## 🚀 Next Steps

**Ready for Phase 5**: Advanced Campaign Features
- Campaign editing and detail views
- Workflow state transitions (Draft → Scheduled → Live → Complete)
- Channel-specific configuration forms
- Advanced reporting and analytics dashboard
- Enhanced user experience and workflows

**Future Enhancements** (Phase 7.5):
- LLM-powered intelligent search with natural language queries
- Semantic search across campaign metadata and content
- AI-powered campaign recommendations and optimization

## 🤝 Contributing

1. Read all documentation in the root directory first
2. Follow the established code quality standards
3. Write tests for all new functionality
4. Ensure all tests pass before submitting changes
5. Use structured logging and error handling patterns

---

**Built with professional standards**: Comprehensive testing, DRY principles, structured logging, and clean architecture.
