import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmExceptionFilter } from '../src/filters/typeorm-exception.filter';
import { nonExistingUuid, uniqueCode } from './testUtils';

describe('VehiclesController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let testSupplierId: string;
  let testDossierId: string;
  let testConteneurId: string;
  let createdVehicleId: string;
  let duplicateVehicleId: string;

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

    // Create test supplier, dossier, and conteneur
    const supplierRes = await request(app.getHttpServer())
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Vehicle Test Supplier', location: 'Japan' });
    testSupplierId = supplierRes.body.id;

    const dossierRes = await request(app.getHttpServer())
      .post('/api/dossiers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        reference: `DOS-VEH-${Date.now()}`,
        supplierId: testSupplierId,
        dateCreation: new Date().toISOString().split('T')[0],
      });
    testDossierId = dossierRes.body.id;

    const conteneurRes = await request(app.getHttpServer())
      .post('/api/conteneurs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        numero: `CONT-VEH-${Date.now()}`,
        dossierId: testDossierId,
        type: '40ft',
      });
    testConteneurId = conteneurRes.body.id;
  });

  afterAll(async () => {
    if (createdVehicleId) {
      await request(app.getHttpServer())
        .delete(`/api/vehicles/${createdVehicleId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    if (duplicateVehicleId) {
      await request(app.getHttpServer())
        .delete(`/api/vehicles/${duplicateVehicleId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    if (testConteneurId) {
      await request(app.getHttpServer())
        .delete(`/api/conteneurs/${testConteneurId}`)
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

  describe('/api/vehicles (GET)', () => {
    it('should return list of vehicles', () => {
      return request(app.getHttpServer())
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should reject without token', () => {
      return request(app.getHttpServer())
        .get('/api/vehicles')
        .expect(401);
    });
  });

  describe('/api/vehicles (POST)', () => {
    it('should create a new vehicle', () => {
      const newVehicle = {
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        vin: uniqueCode('VIN'),
        supplierId: testSupplierId,
        conteneurId: testConteneurId,
        status: 'ordered',
        purchasePrice: 25000,
        localFees: 500,
        orderDate: new Date().toISOString().split('T')[0],
      };

      return request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newVehicle)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.brand).toBe('Toyota');
          expect(res.body.model).toBe('Camry');
          expect(res.body.year).toBe(2023);
          expect(res.body.totalCost).toBeDefined();
          createdVehicleId = res.body.id;
        });
    });

    it('should reject invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({}) // Missing required fields
        .expect(400);
    });

    it('should reject duplicate VIN', async () => {
      const existingVehicle = {
        brand: 'Honda',
        model: 'Accord',
        year: 2023,
        vin: uniqueCode('VIN-DUP'),
        supplierId: testSupplierId,
        conteneurId: testConteneurId,
        purchasePrice: 22000,
        orderDate: new Date().toISOString().split('T')[0],
      };

      const firstRes = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(existingVehicle)
        .expect(201);

      duplicateVehicleId = firstRes.body.id;

      return request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(existingVehicle) // Same VIN
        .expect(409);
    });
  });

  describe('/api/vehicles/:id (GET)', () => {
    it('should return vehicle by id with relations', async () => {
      if (!createdVehicleId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            brand: 'Nissan',
            model: 'Altima',
            year: 2022,
            vin: `VIN-GET-${Date.now()}`,
            supplierId: testSupplierId,
            conteneurId: testConteneurId,
            purchasePrice: 20000,
            orderDate: new Date().toISOString().split('T')[0],
          });
        createdVehicleId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .get(`/api/vehicles/${createdVehicleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdVehicleId);
          expect(res.body.supplier).toBeDefined();
          expect(res.body.conteneur).toBeDefined();
        });
    });

    it('should return 404 for non-existent vehicle', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .get(`/api/vehicles/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/api/vehicles/:id (PATCH)', () => {
    it('should update vehicle', async () => {
      if (!createdVehicleId) {
        const createRes = await request(app.getHttpServer())
          .post('/api/vehicles')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            brand: 'Mazda',
            model: 'CX-5',
            year: 2023,
            vin: `VIN-PATCH-${Date.now()}`,
            supplierId: testSupplierId,
            conteneurId: testConteneurId,
            purchasePrice: 28000,
            orderDate: new Date().toISOString().split('T')[0],
          });
        createdVehicleId = createRes.body.id;
      }

      return request(app.getHttpServer())
        .patch(`/api/vehicles/${createdVehicleId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'in_transit', sellingPrice: 35000 })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('in_transit');
          expect(res.body.sellingPrice).toBe(35000);
        });
    });

    it('should return 404 for non-existent vehicle', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .patch(`/api/vehicles/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'sold' })
        .expect(404);
    });
  });

  describe('/api/vehicles/:id (DELETE)', () => {
    it('should delete vehicle', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          brand: 'Subaru',
          model: 'Outback',
          year: 2023,
          vin: `VIN-DEL-${Date.now()}`,
          supplierId: testSupplierId,
          conteneurId: testConteneurId,
          purchasePrice: 30000,
          orderDate: new Date().toISOString().split('T')[0],
        });
      
      const vehicleToDelete = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/api/vehicles/${vehicleToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/api/vehicles/${vehicleToDelete}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent vehicle', () => {
      const id = nonExistingUuid();
      return request(app.getHttpServer())
        .delete(`/api/vehicles/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
