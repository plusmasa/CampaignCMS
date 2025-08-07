// Response formatting utilities
const successResponse = (data, message = 'Operation completed successfully') => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
};

const errorResponse = (message, statusCode = 500, error = null) => {
  return {
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
    statusCode
  };
};

const paginationResponse = (data, pagination, filters = {}) => {
  return {
    success: true,
    data,
    pagination,
    filters,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginationResponse
};
