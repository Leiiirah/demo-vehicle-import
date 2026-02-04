import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import { api } from './api';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Token Management', () => {
    it('should set token in localStorage', () => {
      api.setToken('test-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
    });

    it('should remove token from localStorage', () => {
      api.removeToken();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('Request Headers', () => {
    it('should include Content-Type header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await api.getUsers();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include Authorization header when token exists', async () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await api.getUsers();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('should not include Authorization header when no token', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await api.getUsers();

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  describe('Login', () => {
    it('should call login endpoint with credentials', async () => {
      const mockResponse = {
        accessToken: 'jwt-token',
        user: { id: '1', email: 'admin@vhlimport.com' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.login('admin@vhlimport.com', 'password123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'admin@vhlimport.com', password: 'password123' }),
        })
      );

      expect(result).toEqual(mockResponse);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'jwt-token');
    });

    it('should throw error on invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      await expect(api.login('wrong@email.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Error Handling', () => {
    it('should throw error on network failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Network error')),
      });

      await expect(api.getUsers()).rejects.toThrow('Network error');
    });

    it('should handle 401 error and redirect to login', async () => {
      const originalHref = window.location.href;
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      });

      await expect(api.getUsers()).rejects.toThrow('Unauthorized');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(window.location.href).toBe('/login');

      Object.defineProperty(window, 'location', {
        value: { href: originalHref },
        writable: true,
      });
    });
  });

  describe('CRUD Operations', () => {
    describe('Users', () => {
      it('should fetch all users', async () => {
        const mockUsers = [{ id: '1', name: 'User 1' }];
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUsers),
        });

        const result = await api.getUsers();
        expect(result).toEqual(mockUsers);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/users'),
          expect.objectContaining({ method: 'GET' })
        );
      });

      it('should fetch single user', async () => {
        const mockUser = { id: '1', name: 'User 1' };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUser),
        });

        const result = await api.getUser('1');
        expect(result).toEqual(mockUser);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/users/1'),
          expect.objectContaining({ method: 'GET' })
        );
      });

      it('should create user', async () => {
        const newUser = { name: 'New User', email: 'new@test.com', password: 'pass123' };
        const createdUser = { id: '2', ...newUser };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createdUser),
        });

        const result = await api.createUser(newUser);
        expect(result).toEqual(createdUser);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/users'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(newUser),
          })
        );
      });

      it('should update user', async () => {
        const updateData = { name: 'Updated Name' };
        const updatedUser = { id: '1', name: 'Updated Name' };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(updatedUser),
        });

        const result = await api.updateUser('1', updateData);
        expect(result).toEqual(updatedUser);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/users/1'),
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify(updateData),
          })
        );
      });

      it('should delete user', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        });

        await api.deleteUser('1');
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/users/1'),
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });

    describe('Suppliers', () => {
      it('should fetch all suppliers', async () => {
        const mockSuppliers = [{ id: '1', name: 'Supplier 1' }];
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSuppliers),
        });

        const result = await api.getSuppliers();
        expect(result).toEqual(mockSuppliers);
      });

      it('should create supplier', async () => {
        const newSupplier = { name: 'New Supplier', location: 'USA' };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: '1', ...newSupplier }),
        });

        await api.createSupplier(newSupplier);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/suppliers'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    });

    describe('Vehicles', () => {
      it('should fetch all vehicles', async () => {
        const mockVehicles = [{ id: '1', brand: 'Toyota', model: 'Camry' }];
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockVehicles),
        });

        const result = await api.getVehicles();
        expect(result).toEqual(mockVehicles);
      });
    });

    describe('Dashboard', () => {
      it('should fetch dashboard stats', async () => {
        const mockStats = {
          totalInvested: 100000,
          totalProfit: 15000,
          vehiclesInTransit: 5,
        };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockStats),
        });

        const result = await api.getDashboardStats();
        expect(result).toEqual(mockStats);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/dashboard/stats'),
          expect.any(Object)
        );
      });

      it('should fetch profit history', async () => {
        const mockHistory = [{ month: 'Jan', profit: 5000 }];
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockHistory),
        });

        const result = await api.getProfitHistory();
        expect(result).toEqual(mockHistory);
      });

      it('should fetch vehicles by status', async () => {
        const mockData = [{ name: 'In Transit', value: 5, color: '#blue' }];
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockData),
        });

        const result = await api.getVehiclesByStatus();
        expect(result).toEqual(mockData);
      });

      it('should fetch top vehicles', async () => {
        const mockData = [{ brand: 'Toyota', model: 'Camry', profit: 5000, margin: 20 }];
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockData),
        });

        const result = await api.getTopVehicles();
        expect(result).toEqual(mockData);
      });
    });
  });
});
