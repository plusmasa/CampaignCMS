# Campaign Management CMS

A professional Node.js/Express backend system for managing marketing campaigns across multiple channels and markets.

## 🚀 Current Status

**Phase 3.5 Complete**: Code Quality Improvements ✅
- ✅ **Backend API**: Complete CRUD operations with validation
- ✅ **Testing Framework**: 33 comprehensive tests with Jest + Supertest
- ✅ **Code Quality**: DRY principles implemented with shared utilities
- ✅ **Professional Architecture**: Structured logging, error handling, and validation
- 🔄 **Next**: Ready for Phase 4 - Frontend Dashboard Development

## 📊 Key Metrics

| Metric | Status |
|--------|---------|
| **API Endpoints** | 15+ complete endpoints |
| **Test Coverage** | 33 tests, all passing ✅ |
| **Code Quality** | DRY compliant, professional structure |
| **Architecture** | Clean separation of concerns |

## 🏗️ Architecture

### Backend Structure
```
backend/
├── routes/           # API endpoints (campaigns, workflow, channels, reports)
├── models/           # Database models (Sequelize ORM)
├── utils/            # Shared utilities (responses, validation, logging)
├── database/         # Connection and initialization
└── data/            # SQLite database
```

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
# Install dependencies
npm install

# Initialize database
npm run reset-db

# Start development server
npm run dev
```

### Available Scripts
- `npm start` - Production server (port 3001)
- `npm run dev` - Development server with auto-reload
- `npm test` - Run comprehensive test suite
- `npm run test:coverage` - Run tests with coverage analysis
- `npm run test:watch` - Run tests in watch mode
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

**Ready for Phase 4**: Frontend Dashboard Development
- React-based admin interface
- Campaign management UI
- Channel configuration forms
- Reporting dashboard
- Responsive design with Material-UI

## 🤝 Contributing

1. Read all documentation in the root directory first
2. Follow the established code quality standards
3. Write tests for all new functionality
4. Ensure all tests pass before submitting changes
5. Use structured logging and error handling patterns

---

**Built with professional standards**: Comprehensive testing, DRY principles, structured logging, and clean architecture.
