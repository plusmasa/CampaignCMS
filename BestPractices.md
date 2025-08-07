# Best Practices for Campaign Management CMS

## Overview
This document outlines the coding standards, testing practices, and development principles we should follow throughout the Campaign CMS project to ensure maintainable, reliable, and professional code.

## 1. Code Quality Principles

### DRY (Don't Repeat Yourself)
- **Never duplicate code logic** - Extract common functionality into reusable functions or modules
- **Create shared utilities** for repetitive operations (validation, response formatting, error handling)
- **Use constants files** for repeated values (valid channels, markets, states)
- **Centralize configuration** in environment variables and config files

### SOLID Principles
- **Single Responsibility**: Each function/class should have one clear purpose
- **Open/Closed**: Code should be open for extension, closed for modification
- **Dependency Inversion**: Depend on abstractions, not concrete implementations

### Clean Code Standards
- **Meaningful naming**: Use descriptive variable and function names
- **Small functions**: Keep functions focused and under 20-30 lines when possible
- **Consistent formatting**: Use consistent indentation, spacing, and structure
- **Comments**: Document complex logic, not obvious code
- **Error handling**: Always handle errors gracefully with meaningful messages

## 2. Testing Strategy

### Unit Testing Requirements
- **Every new feature MUST include unit tests**
- **Minimum 80% code coverage** for all business logic
- **Test both success and failure scenarios**
- **Use descriptive test names** that explain what is being tested
- **Follow AAA pattern**: Arrange, Act, Assert

### Testing Framework Setup
```bash
npm install --save-dev jest supertest
```

### Test Organization
```
/tests
  /unit
    /models
      Campaign.test.js
    /routes  
      campaigns.test.js
      workflow.test.js
      channels.test.js
      reports.test.js
    /utils
      validation.test.js
      responses.test.js
  /integration
    api.integration.test.js
  /fixtures
    testData.js
```

### Test Categories
1. **Unit Tests**: Test individual functions in isolation
2. **Integration Tests**: Test API endpoints end-to-end
3. **Database Tests**: Test model operations and data persistence
4. **Validation Tests**: Test input validation and error handling

### QA Phase Requirements
- **All unit tests must pass** before phase approval
- **New functionality requires corresponding tests**
- **Tests should run automatically** in CI/CD pipeline
- **Test coverage reports** should be generated and reviewed

## 3. Error Handling & Debugging Strategy

### Structured Logging
- **Use consistent log levels**: ERROR, WARN, INFO, DEBUG
- **Include context** in log messages (user ID, campaign ID, operation)
- **Log all API requests** with request ID for tracing
- **Never log sensitive data** (passwords, tokens, personal info)

### Debug Strategy
```javascript
// Use environment-based debugging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Debug: Processing campaign:', campaignId);
}
```

### Error Handling Patterns
```javascript
// Consistent error response format
const errorResponse = (message, statusCode = 500, details = null) => {
  return {
    success: false,
    message,
    error: details,
    timestamp: new Date().toISOString()
  };
};

// Proper async error handling
try {
  const result = await someAsyncOperation();
  return successResponse(result);
} catch (error) {
  logger.error('Operation failed:', error.message, { context: 'additional info' });
  return errorResponse('Operation failed', 500, error.message);
}
```

### Debugging Tools & Techniques
1. **Development Logging**: Detailed logs in development environment
2. **Request Tracing**: Track requests through the entire system
3. **Database Query Logging**: Log slow or problematic queries
4. **API Response Timing**: Monitor endpoint performance
5. **Validation Errors**: Clear, actionable error messages for users

## 4. API Design Standards

### RESTful Conventions
- **Use proper HTTP methods**: GET (read), POST (create), PUT (update), DELETE (remove)
- **Meaningful URLs**: `/api/campaigns/:id/channels` not `/api/getCampaignChannels`
- **Consistent response format**: Always include `success`, `data`, `message` fields
- **HTTP status codes**: Use appropriate codes (200, 201, 400, 404, 500)

### Request/Response Standards
```javascript
// Success Response Format
{
  success: true,
  data: {...},
  message: "Operation completed successfully",
  timestamp: "2025-08-06T12:00:00.000Z"
}

// Error Response Format  
{
  success: false,
  message: "Human-readable error message",
  error: "Technical error details",
  timestamp: "2025-08-06T12:00:00.000Z"
}
```

### Validation Standards
- **Validate all inputs** at API boundaries
- **Use schema validation** (Joi, express-validator, or similar)
- **Sanitize user input** to prevent injection attacks
- **Provide clear validation error messages**

## 5. Database Best Practices

### Model Design
- **Use proper data types** for each field
- **Add database constraints** for data integrity
- **Index frequently queried fields**
- **Use transactions** for multi-table operations

### Query Optimization
- **Avoid N+1 queries** - use proper joins and includes
- **Use pagination** for large result sets
- **Add query monitoring** to identify slow queries
- **Cache frequently accessed data** when appropriate

## 6. Security Practices

### Input Security
- **Sanitize all user inputs**
- **Use parameterized queries** to prevent SQL injection
- **Validate file uploads** if implemented
- **Rate limiting** on API endpoints

### Data Protection
- **Never commit secrets** to version control
- **Use environment variables** for sensitive configuration
- **Implement proper authentication** when required
- **Log security-related events**

## 7. Code Organization & Architecture

### File Structure
```
/backend
  /controllers     # Request handlers (business logic)
  /middleware      # Reusable middleware functions
  /models          # Database models and schemas
  /routes          # Route definitions (thin layer)
  /services        # Business logic services
  /utils           # Shared utility functions
  /validators      # Input validation schemas
  /config          # Configuration files
```

### Separation of Concerns
- **Routes**: Define endpoints and call controllers
- **Controllers**: Handle requests, call services, return responses
- **Services**: Contain business logic
- **Models**: Database operations and data validation
- **Utilities**: Pure functions for common operations

## 8. Development Workflow

### Git Practices
- **Meaningful commit messages**: "Add campaign state validation" not "fix bug"
- **Small, focused commits**: One logical change per commit
- **Use branching strategy**: feature branches for new work
- **Code review process**: All changes reviewed before merging

### Documentation Requirements
- **README files** for setup and usage instructions
- **API documentation** for all endpoints (consider Swagger/OpenAPI)
- **Code comments** for complex business logic
- **Change logs** for version tracking

## 9. Performance Considerations

### Backend Performance
- **Database indexing** on frequently queried columns
- **Query optimization** and monitoring
- **Caching strategies** for static or slow-changing data
- **Pagination** for large datasets
- **Async operations** for I/O bound tasks

### Monitoring & Metrics
- **Response time tracking** for all API endpoints
- **Database query performance** monitoring
- **Error rate tracking** and alerting
- **Resource usage monitoring** (memory, CPU)

## 10. Phase Development Standards

### Phase Completion Criteria
1. **All functionality implemented** according to specifications
2. **Unit tests written and passing** for all new code
3. **Integration tests passing** for API endpoints
4. **Code review completed** and approved
5. **Documentation updated** (API docs, README, etc.)
6. **Performance benchmarks met** (if applicable)
7. **Security review passed** (input validation, error handling)

### QA Checklist for Each Phase
- [ ] All unit tests pass (`npm test`)
- [ ] All integration tests pass
- [ ] Code coverage meets minimum threshold (80%)
- [ ] No security vulnerabilities detected
- [ ] API endpoints respond within acceptable time limits
- [ ] Error handling works correctly for all failure scenarios
- [ ] Input validation prevents invalid data entry
- [ ] Database operations are properly transactional
- [ ] Logging provides sufficient debugging information
- [ ] Code follows established patterns and conventions

### Testing Requirements by Phase
- **Phase 3 (Backend API)**: ✅ Core campaigns route tested (75.94% coverage)
- **Phase 4 (Frontend)**: Focus on functionality, defer component testing to Phase 5
- **Phase 5 (Complete Testing)**: 
  - Backend route testing for workflow, channels, and reports
  - Frontend component tests and user interaction tests
  - Integration testing covering complete user workflows
  - Target: 80% overall code coverage
- **Later Phases**: Performance tests, security tests, accessibility tests

## 11. Implementation Priorities

### Immediate Actions (Phase 3.5 - COMPLETED ✅)
1. ✅ **Set up Jest testing framework** - Complete with 33 comprehensive tests
2. ✅ **Create utility modules** - 5 utility modules eliminate code duplication
3. ✅ **Add input validation middleware** - Centralized validation with error handling  
4. ✅ **Implement structured logging** - Environment-aware logging with context
5. ✅ **Create response formatting utilities** - Standardized success/error responses

### Current Implementation Status
**Phase 4: Frontend Development** ✅ ACTIVE
- Testing framework established (Jest + Supertest)
- Core API routes tested (campaigns.js - 75.94% coverage)
- DRY principles implemented across all tested modules
- Professional error handling and structured logging
- **Test Coverage: 31.61%** (documented technical debt)

**Testing Debt for Phase 5:**
- Route testing for campaign-workflow.js (0% coverage)
- Route testing for channel-management.js (0% coverage)
- Route testing for reports.js (0% coverage)
- Frontend component testing (React Testing Library)
- Integration testing for complete user workflows

### Ongoing Practices
- **Write tests first** (Test-Driven Development when possible)
- **Refactor regularly** to maintain code quality
- **Monitor performance** and optimize bottlenecks
- **Update documentation** with code changes
- **Review and improve** these practices regularly

## 12. Tools & Dependencies

### Recommended Development Tools
```json
{
  "testing": ["jest", "supertest"],
  "validation": ["joi", "express-validator"],
  "logging": ["winston", "morgan"],
  "code-quality": ["eslint", "prettier"],
  "security": ["helmet", "express-rate-limit"],
  "documentation": ["swagger-jsdoc", "swagger-ui-express"]
}
```

### Code Quality Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch", 
    "test:coverage": "jest --coverage",
    "lint": "eslint backend/",
    "lint:fix": "eslint backend/ --fix",
    "format": "prettier --write backend/**/*.js"
  }
}
```

---

## Conclusion

Following these best practices will ensure our Campaign CMS is:
- **Maintainable**: Easy to modify and extend
- **Reliable**: Well-tested and error-resistant
- **Secure**: Protected against common vulnerabilities
- **Performant**: Fast and efficient
- **Professional**: Following industry standards

**Remember**: These practices are not optional - they are requirements for building production-quality software. Every phase must meet these standards before approval.
