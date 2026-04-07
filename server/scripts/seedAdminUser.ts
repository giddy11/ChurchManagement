import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import * as bcrypt from 'bcrypt';

async function seedAdminUser() {
  try {
    await AppDataSource.initialize();
    console.log('✓ Database connected');

    const userRepository = AppDataSource.getRepository(User);

    const existingAdmin = await userRepository.findOne({
      where: { email: 'ferncot1@gmail.com' },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists: ferncot1@gmail.com');
      if (AppDataSource.isInitialized) await AppDataSource.destroy();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123!', 10);

    const adminUser = userRepository.create({
      email: 'ferncot1@gmail.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      full_name: 'Admin User',
      role: 'super_admin',
    });

    await userRepository.save(adminUser);

    console.log('✅ Admin user created successfully');
    console.log(`   Email: ferncot1@gmail.com`);
    console.log(`   Password: admin123!`);
    console.log(`   Role: super_admin`);

    if (AppDataSource.isInitialized) await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
    process.exit(1);
  }
}

seedAdminUser();
