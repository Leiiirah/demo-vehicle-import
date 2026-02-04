import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('SuppliersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdSupplierId: string;

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
    if (createdSupplierId) {
      await request(app.getHttpServer())
        .delete(`/api/suppliers/${createdSupplierId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    await app.close();
  });

  describe('/api/suppliers (GET)', () => {
    it('should return list of suppliers', () => {
      return request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer())
        .get('/api/suppliers')
        .expect(401);
    });
  });

  describe('/api/suppliers (POST)', () => {
    it('should create a new supplier', () => {
      const newSupplier = {
        name: `Test Supplier ${Date.now()}`,
        location: 'USA',
        creditBalance: 50000,
        rating: 4.5,
      };

      return request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newSupplier)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe(newSupplier.name);
          expect(res.body.location).toBe(newSupplier.location);
          createdSupplierId = res.body.id;
        });
    });

    it('should reject invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({}) // Missing required fields
        .expect(400);
    });
  });

  describe('/api/suppliers/:id (GET)', () => {
    it('should return supplier by id', async () => {
      if (!createdSupplierId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/suppliers')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: 'Get Test Supplier', location: 'Germany' });
        createdSupplierId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .get(`/api/suppliers/${createdSupplierId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdSupplierId);
        });
    });

    it('should return 404 for non-existent supplier', () => {
      return request(app.getHttpServer())
        .get('/api/suppliers/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/api/suppliers/:id (PATCH)', () => {
    it('should update supplier', async () => {
      if (!createdSupplierId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/suppliers')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: 'Patch Test Supplier', location: 'Japan' });
        createdSupplierId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .patch(`/api/suppliers/${createdSupplierId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Supplier Name', rating: 5.0 })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Supplier Name');
        });
    });

    it('should return 404 for non-existent supplier', () => {
      return request(app.getHttpServer())
        .patch('/api/suppliers/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('/api/suppliers/:id (DELETE)', () => {
    it('should delete supplier', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Delete Test Supplier', location: 'Korea' });
      
      const supplierToDelete = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/api/suppliers/${supplierToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/api/suppliers/${supplierToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent supplier', () => {
      return request(app.getHttpServer())
        .delete('/api/suppliers/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
