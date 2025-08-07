const { successResponse, errorResponse, paginationResponse } = require('../../backend/utils/responses');

describe('Response Utilities', () => {
  describe('successResponse', () => {
    it('should create a success response with default message', () => {
      const data = { id: 1, name: 'test' };
      const result = successResponse(data);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.message).toBe('Operation completed successfully');
      expect(result.timestamp).toBeDefined();
    });
    
    it('should create a success response with custom message', () => {
      const data = { id: 1 };
      const message = 'Custom success message';
      const result = successResponse(data, message);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.message).toBe(message);
    });
  });
  
  describe('errorResponse', () => {
    it('should create an error response with default status code', () => {
      const message = 'Something went wrong';
      const result = errorResponse(message);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe(message);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBeNull();
      expect(result.timestamp).toBeDefined();
    });
    
    it('should create an error response with custom status and error details', () => {
      const message = 'Validation failed';
      const statusCode = 400;
      const error = 'Title is required';
      const result = errorResponse(message, statusCode, error);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe(message);
      expect(result.statusCode).toBe(statusCode);
      expect(result.error).toBe(error);
    });
  });
  
  describe('paginationResponse', () => {
    it('should create a paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = { currentPage: 1, totalPages: 5, totalCount: 50 };
      const filters = { state: 'Draft' };
      const result = paginationResponse(data, pagination, filters);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.pagination).toEqual(pagination);
      expect(result.filters).toEqual(filters);
      expect(result.timestamp).toBeDefined();
    });
  });
});
