import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('DashboardController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@vhlimport.com', password: 'VHLAdmin2026!' });
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/dashboard/stats (GET)', () => {
    it('should return dashboard statistics', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalInvested');
          expect(res.body).toHaveProperty('totalProfit');
          expect(res.body).toHaveProperty('outstandingDebts');
          expect(res.body).toHaveProperty('vehiclesInTransit');
          expect(res.body).toHaveProperty('vehiclesArrived');
          expect(res.body).toHaveProperty('vehiclesSold');
          expect(res.body).toHaveProperty('vehiclesOrdered');
          expect(res.body).toHaveProperty('totalVehicles');
          
          // Check types
          expect(typeof res.body.totalInvested).toBe('number');
          expect(typeof res.body.totalProfit).toBe('number');
          expect(typeof res.body.totalVehicles).toBe('number');
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .expect(401);
    });
  });

  describe('/api/dashboard/profit-history (GET)', () => {
    it('should return profit history', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/profit-history')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('month');
            expect(res.body[0]).toHaveProperty('profit');
          }
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/profit-history')
        .expect(401);
    });
  });

  describe('/api/dashboard/vehicles-by-status (GET)', () => {
    it('should return vehicles grouped by status', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/vehicles-by-status')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('name');
            expect(res.body[0]).toHaveProperty('value');
            expect(res.body[0]).toHaveProperty('color');
          }
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/vehicles-by-status')
        .expect(401);
    });
  });

  describe('/api/dashboard/top-vehicles (GET)', () => {
    it('should return top vehicles by profit', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/top-vehicles')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('brand');
            expect(res.body[0]).toHaveProperty('model');
            expect(res.body[0]).toHaveProperty('profit');
            expect(res.body[0]).toHaveProperty('margin');
          }
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/top-vehicles')
        .expect(401);
    });
  });
});
