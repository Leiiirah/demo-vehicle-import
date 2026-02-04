import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { nonExistingUuid } from './testUtils';

describe('ConteneursController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let testSupplierId: string;
  let testDossierId: string;
  let createdConteneurId: string;

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

    // Create test supplier and dossier
    const supplierRes = await request(app.getHttpServer())
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Conteneur Test Supplier', location: 'China' });
    testSupplierId = supplierRes.body.id;

    const dossierRes = await request(app.getHttpServer())
      .post('/api/dossiers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        reference: `DOS-CONT-${Date.now()}`,
        supplierId: testSupplierId,
        dateCreation: new Date().toISOString().split('T')[0],
      });
    testDossierId = dossierRes.body.id;
  });

  afterAll(async () => {
    if (createdConteneurId) {
      await request(app.getHttpServer())
        .delete(`/api/conteneurs/${createdConteneurId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    if (testDossierId) {
      await request(app.getHttpServer())
        .delete(`/api/dossiers/${testDossierId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    if (testSupplierId) {
      await request(app.getHttpServer())
        .delete(`/api/suppliers/${testSupplierId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    await app.close();
  });

  describe('/api/conteneurs (GET)', () => {
    it('should return list of conteneurs', () => {
      return request(app.getHttpServer())
        .get('/api/conteneurs')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer())
        .get('/api/conteneurs')
        .expect(401);
    });
  });

  describe('/api/conteneurs (POST)', () => {
    it('should create a new conteneur', () => {
      const newConteneur = {
        numero: `CONT-${Date.now()}`,
        dossierId: testDossierId,
        type: '40ft',
        status: 'en_chargement',
        coutTransport: 5000,
      };

      return request(app.getHttpServer())
        .post('/api/conteneurs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newConteneur)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.numero).toBe(newConteneur.numero);
          expect(res.body.type).toBe('40ft');
          expect(res.body.status).toBe('en_chargement');
          createdConteneurId = res.body.id;
        });
    });

    it('should reject invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/conteneurs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({}) // Missing required fields
        .expect(400);
    });

    it('should reject invalid dossierId', () => {
      return request(app.getHttpServer())
        .post('/api/conteneurs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          numero: 'CONT-INVALID',
          dossierId: 'non-existent-id',
          type: '20ft',
        })
        .expect(400);
    });
  });

  describe('/api/conteneurs/:id (GET)', () => {
    it('should return conteneur by id with dossier relation', async () => {
      if (!createdConteneurId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/conteneurs')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            numero: `CONT-GET-${Date.now()}`,
            dossierId: testDossierId,
            type: '40ft_hc',
          });
        createdConteneurId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .get(`/api/conteneurs/${createdConteneurId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdConteneurId);
          expect(res.body.dossier).toBeDefined();
        });
    });

    it('should return 404 for non-existent conteneur', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .get(`/api/conteneurs/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/api/conteneurs/:id (PATCH)', () => {
    it('should update conteneur', async () => {
      if (!createdConteneurId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/conteneurs')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            numero: `CONT-PATCH-${Date.now()}`,
            dossierId: testDossierId,
            type: '20ft',
          });
        createdConteneurId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .patch(`/api/conteneurs/${createdConteneurId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'en_transit', dateDepart: new Date().toISOString() })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('en_transit');
        });
    });

    it('should return 404 for non-existent conteneur', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .patch(`/api/conteneurs/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'arrive' })
        .expect(404);
    });
  });

  describe('/api/conteneurs/:id (DELETE)', () => {
    it('should delete conteneur', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/conteneurs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          numero: `CONT-DEL-${Date.now()}`,
          dossierId: testDossierId,
          type: '40ft',
        });
      
      const conteneurToDelete = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/api/conteneurs/${conteneurToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/api/conteneurs/${conteneurToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent conteneur', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .delete(`/api/conteneurs/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
