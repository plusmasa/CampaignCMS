// Jest setup file
process.env.NODE_ENV = 'test';

// Set test database path
process.env.DB_PATH = ':memory:';

// Suppress console logs during testing unless debugging
if (!process.env.DEBUG) {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}

// Global test timeout
jest.setTimeout(10000);
