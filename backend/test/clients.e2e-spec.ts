import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { nonExistingUuid } from './testUtils';

describe('ClientsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdClientId: string;

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
    if (createdClientId) {
      await request(app.getHttpServer())
        .delete(`/api/clients/${createdClientId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    await app.close();
  });

  describe('/api/clients (GET)', () => {
    it('should return list of clients', () => {
      return request(app.getHttpServer())
        .get('/api/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer())
        .get('/api/clients')
        .expect(401);
    });
  });

  describe('/api/clients (POST)', () => {
    it('should create a new client', () => {
      const newClient = {
        nom: 'Dupont',
        prenom: 'Jean',
        telephone: '+33612345678',
        email: `jean.dupont.${Date.now()}@email.com`,
        adresse: '123 Rue de Paris',
        company: 'Dupont SARL',
        pourcentageBenefice: 15,
      };

      return request(app.getHttpServer())
        .post('/api/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newClient)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.nom).toBe('Dupont');
          expect(res.body.prenom).toBe('Jean');
          expect(res.body.telephone).toBe('+33612345678');
          createdClientId = res.body.id;
        });
    });

    it('should reject invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({}) // Missing required fields
        .expect(400);
    });
  });

  describe('/api/clients/:id (GET)', () => {
    it('should return client by id', async () => {
      if (!createdClientId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/clients')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            nom: 'Martin',
            prenom: 'Pierre',
            telephone: '+33698765432',
          });
        createdClientId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .get(`/api/clients/${createdClientId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdClientId);
        });
    });

    it('should return 404 for non-existent client', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .get(`/api/clients/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/api/clients/:id (PATCH)', () => {
    it('should update client', async () => {
      if (!createdClientId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/clients')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            nom: 'Bernard',
            prenom: 'Marie',
            telephone: '+33611111111',
          });
        createdClientId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .patch(`/api/clients/${createdClientId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ telephone: '+33699999999', paye: true })
        .expect(200)
        .expect((res) => {
          expect(res.body.telephone).toBe('+33699999999');
          expect(res.body.paye).toBe(true);
        });
    });

    it('should return 404 for non-existent client', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .patch(`/api/clients/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ paye: true })
        .expect(404);
    });
  });

  describe('/api/clients/:id (DELETE)', () => {
    it('should delete client', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/clients')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nom: 'ToDelete',
          prenom: 'Client',
          telephone: '+33600000000',
        });
      
      const clientToDelete = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/api/clients/${clientToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/api/clients/${clientToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent client', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .delete(`/api/clients/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
