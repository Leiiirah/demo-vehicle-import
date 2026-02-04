import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmExceptionFilter } from '../src/filters/typeorm-exception.filter';
import { nonExistingUuid } from './testUtils';

describe('PasseportsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdPasseportId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new TypeOrmExceptionFilter());
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@vhlimport.com', password: 'VHLAdmin2026!' });
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    if (createdPasseportId) {
      await request(app.getHttpServer())
        .delete(`/api/passeports/${createdPasseportId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    await app.close();
  });

  describe('/api/passeports (GET)', () => {
    it('should return list of passeports', () => {
      return request(app.getHttpServer())
        .get('/api/passeports')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer())
        .get('/api/passeports')
        .expect(401);
    });
  });

  describe('/api/passeports (POST)', () => {
    it('should create a new passeport', () => {
      const newPasseport = {
        nom: 'Benali',
        prenom: 'Ahmed',
        telephone: '+213555123456',
        adresse: 'Alger, Algérie',
        numeroPasseport: `PASS-${Date.now()}`,
        montantDu: 50000,
        paye: false,
      };

      return request(app.getHttpServer())
        .post('/api/passeports')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newPasseport)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.nom).toBe('Benali');
          expect(res.body.prenom).toBe('Ahmed');
          expect(res.body.numeroPasseport).toBe(newPasseport.numeroPasseport);
          expect(res.body.montantDu).toBe(50000);
          createdPasseportId = res.body.id;
        });
    });

    it('should reject invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/passeports')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({}) // Missing required fields
        .expect(400);
    });

    it('should reject duplicate passport number', async () => {
      const passeportNumber = `PASS-DUP-${Date.now()}`;
      
      await request(app.getHttpServer())
        .post('/api/passeports')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nom: 'Test',
          prenom: 'Dup',
          telephone: '+213555000001',
          numeroPasseport: passeportNumber,
        });

      return request(app.getHttpServer())
        .post('/api/passeports')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nom: 'Test2',
          prenom: 'Dup2',
          telephone: '+213555000002',
          numeroPasseport: passeportNumber, // Same number
        })
        .expect(409);
    });
  });

  describe('/api/passeports/:id (GET)', () => {
    it('should return passeport by id', async () => {
      if (!createdPasseportId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/passeports')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            nom: 'Kader',
            prenom: 'Fatima',
            telephone: '+213555111222',
            numeroPasseport: `PASS-GET-${Date.now()}`,
          });
        createdPasseportId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .get(`/api/passeports/${createdPasseportId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdPasseportId);
        });
    });

    it('should return 404 for non-existent passeport', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .get(`/api/passeports/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/api/passeports/:id (PATCH)', () => {
    it('should update passeport', async () => {
      if (!createdPasseportId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/passeports')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            nom: 'Saidi',
            prenom: 'Omar',
            telephone: '+213555333444',
            numeroPasseport: `PASS-PATCH-${Date.now()}`,
          });
        createdPasseportId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .patch(`/api/passeports/${createdPasseportId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ montantDu: 75000, paye: true })
        .expect(200)
        .expect((res) => {
          expect(res.body.montantDu).toBe(75000);
          expect(res.body.paye).toBe(true);
        });
    });

    it('should return 404 for non-existent passeport', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .patch(`/api/passeports/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ paye: true })
        .expect(404);
    });
  });

  describe('/api/passeports/:id (DELETE)', () => {
    it('should delete passeport', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/passeports')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nom: 'ToDelete',
          prenom: 'Passeport',
          telephone: '+213555999888',
          numeroPasseport: `PASS-DEL-${Date.now()}`,
        });
      
      const passeportToDelete = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/api/passeports/${passeportToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/api/passeports/${passeportToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent passeport', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .delete(`/api/passeports/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
