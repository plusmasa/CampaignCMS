# Campaign Management CMS

A professional Node.js/Express backend system for managing marketing campaigns across multiple channels and markets.

## � Recent Highlights (Phase 9)

- Offer editor: CTA field; character limits and counters (Header 30, Description 75, CTA 30)
- Offer editor: SKU + Form Label fields; computed Redeem URL in Draft; read-only view shows URL with Copy button
- Header actions: icon-only transparent actions now precede secondary/primary across states
- Dashboard: Partner column with filter; column visibility persists

## �🚀 Current Status

**Phase 6 Complete**: Workflow and State Management ✅
**Phase 5 Complete**: Campaign Detail View & Editor ✅
## 🚀 Current Status

**Multi-market variants editor**: Draft supports multiple market variants per campaign ✅
**AI suggestions**: Local endpoint to suggest variant content for a target market ✅
**Phase 6 Complete**: Workflow and State Management ✅
**Phase 5 Complete**: Campaign Detail View & Editor ✅
	- Variants: add/duplicate/delete, per-variant market selection, uniqueness guard
	- Read-only rendering shows all persisted variants by market
 🌀 **Next**: Phase 7 – Channel configuration UI and reporting
## 📊 Key Metrics

| Metric | Status |
|--------|---------|
| **Backend Endpoints** | 15+ complete REST API endpoints |
| **Test Coverage** | 33 tests, all passing ✅ |
| **Frontend Components** | Professional React components with Fluent 2 |
| **Advanced Filtering** | Multi-dimensional search and date filtering |
| **Type Safety** | Full TypeScript integration |

If you see “Error Loading Campaigns,” ensure the backend runs from the `campaign-cms/` project root and check http://localhost:3001/api/health
| **Architecture** | Clean separation of concerns, DRY compliant |

## 🏗️ Architecture
### AI Suggestions
- `POST /api/ai/suggest` – Suggest a new variant for a target market; request body: `{ type, sourceConfig, targetMarket }`


### Backend Structure
```
backend/
├── routes/           # API endpoints (campaigns, workflow, channels, reports)
├── models/           # Database models (Sequelize ORM)
├── utils/            # Shared utilities (responses, validation, logging)
├── database/         # Connection and initialization
└── data/            # SQLite database
```

### Frontend Architecture (Phase 6 ✅)
- **React 18+ with TypeScript**: Full type safety and modern React patterns
- **Microsoft Fluent 2**: Enterprise design system with professional components
- **Vite Build Tool**: Fast development and optimized production builds
- **Advanced Filtering System**: Multi-dimensional filtering with date ranges
- **Campaign Editor**: State-aware actions (Publish, Schedule, Unschedule, Stop, Duplicate)
- **Workflow UX**: Confirmation dialogs, toasts, and validations
- **Timezone**: Display in America/Los_Angeles for non-Draft states
- **Column Visibility Controls**: Customizable DataGrid with toggle menu
- **Left Navigation**: Vertical navigation for multi-page CMS structure
- **Campaign ID System**: Unique structured campaign identifiers
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **responses.js**: Standardized API response formatting
- **validation.js**: Centralized input validation logic
- **constants.js**: Single source of truth for valid values
- **logger.js**: Structured logging with environment awareness
- **middleware.js**: Reusable middleware functions

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
 `PUT /api/workflow/campaigns/:id/transition` - Transition campaign state (generic)
 `POST /api/workflow/publish/:id` - Publish Draft (immediately Live or Scheduled if a future publishDate is provided)
 `POST /api/workflow/campaigns/:id/schedule` - Schedule campaign (future start)
 `POST /api/workflow/unschedule/:id` - Unschedule a Scheduled campaign back to Draft
 `POST /api/workflow/reschedule/:id` - Change publish date of a Scheduled campaign (publishes immediately if past)
 `POST /api/workflow/stop/:id` - Stop a Live campaign (mark Complete)

### Channel Management
 - **Workflow Gating**: Server-side gating for Publish/Schedule/Reschedule (requires channels, valid content config per type, unique markets per variant, valid date ranges, and channelConfig required fields)
 - **Client-side Channel Validation**: Pre-submit per-channel validation to surface missing/invalid settings before API calls
### Dashboard Interface
- **Campaign Listing**: Professional DataGrid with sorting and advanced filtering
- **Multi-Dimensional Filtering**: Search, state, market, channel, and date filtering
- **Column Visibility Controls**: Toggle columns on/off with persistent menu
- **Date Range Filtering**: Last 7/30/90/365 days plus custom date selection
- **Left Navigation**: Vertical nav for Campaigns, Partners, Analytics, Media Library
- **Real-Time Search**: Instant search across titles, states, channels, markets, and dates
- **Visual Indicators**: Color-coded badges for campaign states
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### Campaign Management
- **Create/Edit Campaign**: Dedicated editor with Fluent UI components and validation
- **Delete Campaign**: Confirmation dialog with safety checks (Draft only)
- **Workflow Controls**: Publish now, Schedule for later, Unschedule, Stop
- **Duplicate**: Secondary action adds “(copy)” and opens in a new tab
- **Success Toasts**: Small notifications for state changes
- **Timezone**: Pacific time display for scheduled/live states
- **Campaign ID System**: Unique structured identifiers (CAMP-2025-XX-NNN)
- **Bulk Upload UI**: Secondary button with upload icon for future CSV/Excel import
- **Campaign Preview**: Detailed campaign information display
- **Error Handling**: User-friendly error messages and loading states

### Technical Features
- **TypeScript Integration**: Full type safety across the application
- **Microsoft Fluent 2**: Professional enterprise design components
- **Client-Side Performance**: Instant filtering without API calls
- **Modern React Patterns**: Hooks, context, and functional components
- **Advanced State Management**: Complex filter state with proper React patterns
- **Date Manipulation**: Professional date filtering with date-fns library
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

**Ready for Phase 7**: Channel Configuration and Reporting
- Channel-specific configuration forms and validation
- Reporting dashboard and metrics per campaign/channel
- Enhanced analytics and export features

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
