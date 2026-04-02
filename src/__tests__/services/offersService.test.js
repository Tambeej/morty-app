/**
 * Tests for offersService module.
 */
import * as offersService from '../../services/offersService';

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

import api from '../../services/api';

describe('offersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listOffers', () => {
    it('should call GET /offers and return data', async () => {
      const mockData = { offers: [], pagination: { total: 0, page: 1 } };
      api.get.mockResolvedValue({ data: { data: mockData } });

      const result = await offersService.listOffers();
      expect(api.get).toHaveBeenCalledWith('/offers', { params: {} });
      expect(result).toEqual(mockData);
    });

    it('should pass query params', async () => {
      api.get.mockResolvedValue({ data: { data: { offers: [], pagination: {} } } });
      await offersService.listOffers({ status: 'analyzed', page: 2 });
      expect(api.get).toHaveBeenCalledWith('/offers', { params: { status: 'analyzed', page: 2 } });
    });
  });

  describe('getOfferStats', () => {
    it('should call GET /offers/stats', async () => {
      const mockStats = { total: 5, pending: 1, analyzed: 4 };
      api.get.mockResolvedValue({ data: { data: { stats: mockStats } } });

      const result = await offersService.getOfferStats();
      expect(api.get).toHaveBeenCalledWith('/offers/stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('deleteOffer', () => {
    it('should call DELETE /offers/:id', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });
      await offersService.deleteOffer('offer-123');
      expect(api.delete).toHaveBeenCalledWith('/offers/offer-123');
    });
  });

  describe('uploadOffer', () => {
    it('should call POST /offers with multipart/form-data', async () => {
      const mockOffer = { _id: 'new-offer', status: 'pending' };
      api.post.mockResolvedValue({ data: { data: { offer: mockOffer } } });

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const result = await offersService.uploadOffer(file, 'Hapoalim');

      expect(api.post).toHaveBeenCalledWith(
        '/offers',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      expect(result).toEqual(mockOffer);
    });
  });
});
