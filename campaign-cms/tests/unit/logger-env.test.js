/* eslint-disable no-console */
let logger;

describe('utils/logger environment behavior', () => {
  const origEnv = process.env.NODE_ENV;
  const origConsole = { log: console.log, warn: console.warn, error: console.error };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = origEnv;
    console.log = origConsole.log;
    console.warn = origConsole.warn;
    console.error = origConsole.error;
  jest.resetModules();
  });

  it('does not log in test env', () => {
  // In test env, module is already loaded from setup; import directly
  logger = require('../../backend/utils/logger').logger;
    process.env.NODE_ENV = 'test';
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    logger.info('info');
    logger.warn('warn');
    logger.error('error');
    expect(console.log).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('debug logs only in development', () => {
  // Must set env before requiring the module, as flags are computed at import time
  process.env.NODE_ENV = 'development';
  jest.resetModules();
  logger = require('../../backend/utils/logger').logger;
    console.log = jest.fn();
    logger.debug('debug');
    expect(console.log).toHaveBeenCalled();

  jest.clearAllMocks();
  process.env.NODE_ENV = 'production';
  jest.resetModules();
  logger = require('../../backend/utils/logger').logger;
  logger.debug('debug'); // should not log in production
    expect(console.log).not.toHaveBeenCalled();
  });
});
