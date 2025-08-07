const { globalErrorHandler } = require('../../backend/utils/middleware');
const { errorResponse } = require('../../backend/utils/responses');

// Mock the responses utility
jest.mock('../../backend/utils/responses', () => ({
  errorResponse: jest.fn((message, statusCode) => ({
    success: false,
    message,
    statusCode
  }))
}));

describe('Middleware Functions', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      path: '/test',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('globalErrorHandler', () => {
    it('should handle basic errors with 500 status', () => {
      const error = new Error('Test error');

      errorResponse.mockReturnValue({
        success: false,
        message: 'Internal server error',
        statusCode: 500
      });

      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
      expect(errorResponse).toHaveBeenCalled();
    });

    it('should handle errors in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Sensitive error details');
      globalErrorHandler(error, req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        'An internal error occurred',
        500
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle errors in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Debug error details');
      globalErrorHandler(error, req, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        'Debug error details',
        500
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
});
