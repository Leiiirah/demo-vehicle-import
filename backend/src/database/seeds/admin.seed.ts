import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../../entities/user.entity';

export async function seedAdmin(dataSource: DataSource) {
  console.log('🔐 Seeding admin user...');

  const userRepository = dataSource.getRepository(User);

  // Check if admin already exists
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@vhlimport.com' },
  });

  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists, skipping');
    return;
  }

  const hashedPassword = await bcrypt.hash('VHLAdmin2026!', 10);

  const admin = userRepository.create({
    name: 'Administrateur NGB',
    email: 'admin@vhlimport.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  });

  await userRepository.save(admin);
  console.log('✅ Admin user created: admin@vhlimport.com / VHLAdmin2026!');
}
