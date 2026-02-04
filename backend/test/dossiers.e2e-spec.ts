import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { nonExistingUuid } from './testUtils';

describe('DossiersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let testSupplierId: string;
  let createdDossierId: string;

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

    // Create a test supplier for dossiers
    const supplierRes = await request(app.getHttpServer())
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Dossier Test Supplier', location: 'USA' });
    testSupplierId = supplierRes.body.id;
  });

  afterAll(async () => {
    if (createdDossierId) {
      await request(app.getHttpServer())
        .delete(`/api/dossiers/${createdDossierId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    if (testSupplierId) {
      await request(app.getHttpServer())
        .delete(`/api/suppliers/${testSupplierId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    await app.close();
  });

  describe('/api/dossiers (GET)', () => {
    it('should return list of dossiers', () => {
      return request(app.getHttpServer())
        .get('/api/dossiers')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer())
        .get('/api/dossiers')
        .expect(401);
    });
  });

  describe('/api/dossiers (POST)', () => {
    it('should create a new dossier', () => {
      const newDossier = {
        reference: `DOS-${Date.now()}`,
        supplierId: testSupplierId,
        dateCreation: new Date().toISOString().split('T')[0],
        status: 'en_cours',
      };

      return request(app.getHttpServer())
        .post('/api/dossiers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newDossier)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.reference).toBe(newDossier.reference);
          expect(res.body.status).toBe('en_cours');
          createdDossierId = res.body.id;
        });
    });

    it('should reject invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/dossiers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({}) // Missing required fields
        .expect(400);
    });

    it('should reject invalid supplierId', () => {
      return request(app.getHttpServer())
        .post('/api/dossiers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          reference: 'DOS-INVALID',
          supplierId: 'non-existent-id',
          dateCreation: new Date().toISOString().split('T')[0],
        })
        .expect(400);
    });
  });

  describe('/api/dossiers/:id (GET)', () => {
    it('should return dossier by id with supplier relation', async () => {
      if (!createdDossierId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/dossiers')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            reference: `DOS-GET-${Date.now()}`,
            supplierId: testSupplierId,
            dateCreation: new Date().toISOString().split('T')[0],
          });
        createdDossierId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .get(`/api/dossiers/${createdDossierId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdDossierId);
          expect(res.body.supplier).toBeDefined();
        });
    });

    it('should return 404 for non-existent dossier', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .get(`/api/dossiers/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/api/dossiers/:id (PATCH)', () => {
    it('should update dossier', async () => {
      if (!createdDossierId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/dossiers')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            reference: `DOS-PATCH-${Date.now()}`,
            supplierId: testSupplierId,
            dateCreation: new Date().toISOString().split('T')[0],
          });
        createdDossierId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .patch(`/api/dossiers/${createdDossierId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'termine' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('termine');
        });
    });

    it('should return 404 for non-existent dossier', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .patch(`/api/dossiers/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'termine' })
        .expect(404);
    });
  });

  describe('/api/dossiers/:id (DELETE)', () => {
    it('should delete dossier', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/dossiers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          reference: `DOS-DEL-${Date.now()}`,
          supplierId: testSupplierId,
          dateCreation: new Date().toISOString().split('T')[0],
        });
      
      const dossierToDelete = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/api/dossiers/${dossierToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/api/dossiers/${dossierToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent dossier', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .delete(`/api/dossiers/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
