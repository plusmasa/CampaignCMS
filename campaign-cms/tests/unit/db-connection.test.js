/* eslint-disable no-console */
const { sequelize, testConnection } = require('../../backend/database/connection');

describe('database/connection testConnection', () => {
  const origLog = console.log;
  const origError = console.error;

  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = origLog;
    console.error = origError;
    jest.restoreAllMocks();
  });

  it('returns true when authenticate succeeds', async () => {
    jest.spyOn(sequelize, 'authenticate').mockResolvedValueOnce();
    const ok = await testConnection();
    expect(ok).toBe(true);
    expect(console.log).toHaveBeenCalled();
  });

  it('returns false when authenticate throws', async () => {
    jest.spyOn(sequelize, 'authenticate').mockRejectedValueOnce(new Error('nope'));
    const ok = await testConnection();
    expect(ok).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
});
