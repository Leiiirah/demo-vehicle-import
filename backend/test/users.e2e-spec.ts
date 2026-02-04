import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { nonExistingUuid } from './testUtils';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Login to get access token
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@vhlimport.com', password: 'VHLAdmin2026!' });
    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup: delete created user if exists
    if (createdUserId) {
      await request(app.getHttpServer())
        .delete(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    await app.close();
  });

  describe('/api/users (GET)', () => {
    it('should return list of users', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect(401);
    });
  });

  describe('/api/users (POST)', () => {
    it('should create a new user', () => {
      const newUser = {
        name: 'Test User',
        email: `test-${Date.now()}@vhlimport.com`,
        password: 'TestPassword123!',
        role: 'user',
      };

      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe(newUser.name);
          expect(res.body.email).toBe(newUser.email);
          expect(res.body.password).toBeUndefined(); // Password should not be returned
          createdUserId = res.body.id;
        });
    });

    it('should reject duplicate email', async () => {
      const existingUser = {
        name: 'Duplicate User',
        email: 'admin@vhlimport.com', // Already exists
        password: 'TestPassword123!',
      };

      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(existingUser)
        .expect(409);
    });

    it('should reject invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Test' }) // Missing required fields
        .expect(400);
    });
  });

  describe('/api/users/:id (GET)', () => {
    it('should return user by id', async () => {
      // First get all users to get a valid ID
      const usersRes = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${accessToken}`);
      
      const userId = usersRes.body[0].id;

      return request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
        });
    });

    it('should return 404 for non-existent user', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .get(`/api/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/api/users/:id (PATCH)', () => {
    it('should update user', async () => {
      if (!createdUserId) {
        // Create a user first
        const createRes = await request(app.getHttpServer())
          .post('/api/users')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: 'Update Test User',
            email: `update-${Date.now()}@vhlimport.com`,
            password: 'TestPassword123!',
          });
        createdUserId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .patch(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
        });
    });

    it('should return 404 for non-existent user', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .patch(`/api/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('/api/users/:id (DELETE)', () => {
    it('should delete user', async () => {
      // Create a user to delete
      const createRes = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Delete Test User',
          email: `delete-${Date.now()}@vhlimport.com`,
          password: 'TestPassword123!',
        });
      
      const userToDelete = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/api/users/${userToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify user is deleted
      return request(app.getHttpServer())
        .get(`/api/users/${userToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .delete(`/api/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
