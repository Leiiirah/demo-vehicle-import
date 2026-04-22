import { describe, it, expect, beforeAll } from 'vitest';
import { api } from './api';
import { seedVehicles, seedPasseports } from '@/mocks/seedData';

describe('getPasseports vehicleCount', () => {
  beforeAll(() => {
    // Reset localStorage so the API reseeds from mocks deterministically
    if (typeof localStorage !== 'undefined') localStorage.clear();
  });

  it('matches the number of vehicles linked by passeportId for each passeport', async () => {
    const passeports = await api.getPasseports();
    expect(passeports.length).toBe(seedPasseports.length);

    for (const p of passeports as Array<{ id: string; vehicleCount: number }>) {
      const expected = seedVehicles.filter((v) => v.passeportId === p.id).length;
      expect(p.vehicleCount).toBe(expected);
    }
  });

  it('includes at least one passeport with vehicles to prove the count is non-trivial', async () => {
    const passeports = (await api.getPasseports()) as Array<{ vehicleCount: number }>;
    expect(passeports.some((p) => p.vehicleCount > 0)).toBe(true);
  });
});