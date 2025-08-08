const { findCampaignById, validateCampaignExists, handleAsyncError, globalErrorHandler } = require('../../backend/utils/middleware');
const { Campaign } = require('../../backend/models');

jest.mock('../../backend/models', () => ({
  Campaign: { findByPk: jest.fn() }
}));

describe('utils/middleware additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findCampaignById', () => {
    it('returns campaign when found', async () => {
      const mock = { id: 1, title: 'X' };
      Campaign.findByPk.mockResolvedValueOnce(mock);
      const result = await findCampaignById(1);
      expect(result).toBe(mock);
      expect(Campaign.findByPk).toHaveBeenCalledWith(1);
    });

    it('throws when not found', async () => {
      Campaign.findByPk.mockResolvedValueOnce(null);
      await expect(findCampaignById(999)).rejects.toThrow('Campaign not found');
    });
  });

  describe('validateCampaignExists', () => {
    const makeRes = () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      return res;
    };

    it('attaches campaign to req and calls next', async () => {
      const mock = { id: 7 };
      Campaign.findByPk.mockResolvedValueOnce(mock);
      const req = { params: { id: 7 } };
      const res = makeRes();
      const next = jest.fn();
      await validateCampaignExists(req, res, next);
      expect(req.campaign).toBe(mock);
      expect(next).toHaveBeenCalled();
    });

    it('responds 404 when not found', async () => {
      Campaign.findByPk.mockResolvedValueOnce(null);
      const req = { params: { id: 123 } };
      const res = makeRes();
      const next = jest.fn();
      await validateCampaignExists(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('responds 500 on unexpected error', async () => {
      Campaign.findByPk.mockRejectedValueOnce(new Error('db is down'));
      const req = { params: { id: 1 } };
      const res = makeRes();
      const next = jest.fn();
      await validateCampaignExists(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('handleAsyncError', () => {
    it('passes rejected promise to next', async () => {
      const error = new Error('boom');
      const wrapped = handleAsyncError(async () => { throw error; });
      const next = jest.fn();
      await wrapped({}, {}, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('globalErrorHandler', () => {
    const origEnv = process.env.NODE_ENV;
    const makeRes = () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      return res;
    };

    afterEach(() => { process.env.NODE_ENV = origEnv; });

    it('exposes message in non-production', () => {
      process.env.NODE_ENV = 'development';
      const err = new Error('specific message');
      const res = makeRes();
      globalErrorHandler(err, { path: '/x', method: 'GET' }, res, () => {});
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'specific message' }));
    });

    it('hides message in production', () => {
      process.env.NODE_ENV = 'production';
      const err = new Error('top secret');
      const res = makeRes();
      globalErrorHandler(err, { path: '/x', method: 'GET' }, res, () => {});
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'An internal error occurred' }));
    });
  });
});
