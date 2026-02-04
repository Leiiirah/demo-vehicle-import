import { AppDataSource } from '../../config/data-source';
import { seedAdmin } from './admin.seed';
import { seedSampleData } from './sample-data.seed';

async function runSeeds() {
  console.log('🌱 Starting database seeding...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Run seeds
    await seedAdmin(AppDataSource);
    await seedSampleData(AppDataSource);

    console.log('✅ All seeds completed successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

runSeeds();
