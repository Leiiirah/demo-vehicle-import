import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PaymentsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let testSupplierId: string;
  let testClientId: string;
  let createdPaymentId: string;

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

    // Create test supplier and client
    const supplierRes = await request(app.getHttpServer())
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Payment Test Supplier', location: 'USA' });
    testSupplierId = supplierRes.body.id;

    const clientRes = await request(app.getHttpServer())
      .post('/api/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nom: 'Payment',
        prenom: 'TestClient',
        telephone: '+33600111222',
      });
    testClientId = clientRes.body.id;
  });

  afterAll(async () => {
    if (createdPaymentId) {
      await request(app.getHttpServer())
        .delete(`/api/payments/${createdPaymentId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    if (testClientId) {
      await request(app.getHttpServer())
        .delete(`/api/clients/${testClientId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    if (testSupplierId) {
      await request(app.getHttpServer())
        .delete(`/api/suppliers/${testSupplierId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    await app.close();
  });

  describe('/api/payments (GET)', () => {
    it('should return list of payments', () => {
      return request(app.getHttpServer())
        .get('/api/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer())
        .get('/api/payments')
        .expect(401);
    });
  });

  describe('/api/payments (POST)', () => {
    it('should create a supplier payment', () => {
      const newPayment = {
        date: new Date().toISOString().split('T')[0],
        amount: 15000,
        currency: 'USD',
        exchangeRate: 1,
        type: 'supplier_payment',
        reference: `PAY-SUP-${Date.now()}`,
        status: 'completed',
        supplierId: testSupplierId,
      };

      return request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newPayment)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.amount).toBe(15000);
          expect(res.body.type).toBe('supplier_payment');
          expect(res.body.currency).toBe('USD');
          createdPaymentId = res.body.id;
        });
    });

    it('should create a client payment', async () => {
      const newPayment = {
        date: new Date().toISOString().split('T')[0],
        amount: 5000000,
        currency: 'DZD',
        exchangeRate: 137,
        type: 'client_payment',
        reference: `PAY-CLI-${Date.now()}`,
        status: 'pending',
        clientId: testClientId,
      };

      return request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newPayment)
        .expect(201)
        .expect((res) => {
          expect(res.body.type).toBe('client_payment');
          expect(res.body.currency).toBe('DZD');
          expect(res.body.status).toBe('pending');
        });
    });

    it('should create a transport payment', () => {
      const newPayment = {
        date: new Date().toISOString().split('T')[0],
        amount: 3500,
        currency: 'USD',
        type: 'transport',
        reference: `PAY-TRA-${Date.now()}`,
        status: 'completed',
      };

      return request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newPayment)
        .expect(201)
        .expect((res) => {
          expect(res.body.type).toBe('transport');
        });
    });

    it('should create a fees payment', () => {
      const newPayment = {
        date: new Date().toISOString().split('T')[0],
        amount: 800,
        currency: 'USD',
        type: 'fees',
        reference: `PAY-FEE-${Date.now()}`,
        status: 'completed',
      };

      return request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newPayment)
        .expect(201)
        .expect((res) => {
          expect(res.body.type).toBe('fees');
        });
    });

    it('should reject invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({}) // Missing required fields
        .expect(400);
    });

    it('should reject invalid payment type', () => {
      return request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          date: new Date().toISOString().split('T')[0],
          amount: 1000,
          type: 'invalid_type',
          reference: 'PAY-INVALID',
        })
        .expect(400);
    });
  });

  describe('/api/payments/:id (GET)', () => {
    it('should return payment by id with relations', async () => {
      if (!createdPaymentId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/payments')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            date: new Date().toISOString().split('T')[0],
            amount: 2000,
            type: 'fees',
            reference: `PAY-GET-${Date.now()}`,
          });
        createdPaymentId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .get(`/api/payments/${createdPaymentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdPaymentId);
        });
    });

    it('should return 404 for non-existent payment', () => {
      return request(app.getHttpServer())
        .get('/api/payments/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/api/payments/:id (PATCH)', () => {
    it('should update payment', async () => {
      if (!createdPaymentId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/payments')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            date: new Date().toISOString().split('T')[0],
            amount: 3000,
            type: 'fees',
            reference: `PAY-PATCH-${Date.now()}`,
            status: 'pending',
          });
        createdPaymentId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .patch(`/api/payments/${createdPaymentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'completed', amount: 3500 })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('completed');
          expect(res.body.amount).toBe(3500);
        });
    });

    it('should return 404 for non-existent payment', () => {
      return request(app.getHttpServer())
        .patch('/api/payments/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'completed' })
        .expect(404);
    });
  });

  describe('/api/payments/:id (DELETE)', () => {
    it('should delete payment', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          date: new Date().toISOString().split('T')[0],
          amount: 500,
          type: 'fees',
          reference: `PAY-DEL-${Date.now()}`,
        });
      
      const paymentToDelete = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/api/payments/${paymentToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/api/payments/${paymentToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent payment', () => {
      return request(app.getHttpServer())
        .delete('/api/payments/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
