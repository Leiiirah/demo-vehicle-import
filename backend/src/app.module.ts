import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { DossiersModule } from './modules/dossiers/dossiers.module';
import { ConteneursModule } from './modules/conteneurs/conteneurs.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ClientsModule } from './modules/clients/clients.module';
import { PasseportsModule } from './modules/passeports/passeports.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SearchModule } from './modules/search/search.module';
import { CaisseModule } from './modules/caisse/caisse.module';
import { CarModelsModule } from './modules/car-models/car-models.module';
import { ZakatModule } from './modules/zakat/zakat.module';
import { SalesModule } from './modules/sales/sales.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'vhlimport_user'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'vhlimport'),
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        synchronize: false,
        logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    SuppliersModule,
    DossiersModule,
    ConteneursModule,
    VehiclesModule,
    ClientsModule,
    PasseportsModule,
    PaymentsModule,
    DashboardModule,
    SearchModule,
    CaisseModule,
    CarModelsModule,
    ZakatModule,
    SalesModule,
  ],
})
export class AppModule {}
