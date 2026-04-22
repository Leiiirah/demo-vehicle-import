import { describe, it, expect, beforeAll } from 'vitest';
import { api } from './api';
import { seedVehicles, seedPasseports } from '@/mocks/seedData';

describe('getPasseport detail vehicles list', () => {
  beforeAll(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  });

  it('returns a vehicles array whose length equals vehicleCount for each passeport', async () => {
    for (const seed of seedPasseports) {
      const detail = (await api.getPasseport(seed.id)) as {
        id: string;
        vehicles: Array<{ id: string; passeportId?: string }>;
        vehicleCount: number;
      };

      const expected = seedVehicles.filter((v) => v.passeportId === seed.id).length;

      expect(Array.isArray(detail.vehicles)).toBe(true);
      expect(detail.vehicles.length).toBe(expected);
      expect(detail.vehicleCount).toBe(expected);
      expect(detail.vehicles.length).toBe(detail.vehicleCount);

      // Every returned vehicle must indeed reference this passeport
      for (const v of detail.vehicles) {
        expect(v.passeportId).toBe(seed.id);
      }
    }
  });
});
