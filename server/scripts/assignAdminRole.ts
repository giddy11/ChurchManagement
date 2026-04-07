import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';

async function assignAdminRole(email: string) {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    user.role = 'admin';
    await userRepository.save(user);

    console.log(`✅ Successfully assigned admin role to user: ${email}`);
    console.log(`   Role: admin`);
  } catch (error) {
    console.error('❌ Error assigning admin role:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

async function main() {
  const email = process.argv[2];

  if (email) {
    await assignAdminRole(email);
  } else {
    try {
      await AppDataSource.initialize();
      console.log('Database connected');

      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find();

      if (users.length === 0) {
        console.error('❌ No users found in database');
        process.exit(1);
      }

      const nonAdminUsers = users.filter(user => !user.role || user.role !== 'admin');

      if (nonAdminUsers.length === 0) {
        console.log('✅ All users already have admin role');
        process.exit(0);
      }

      console.log(`\nFound ${nonAdminUsers.length} user(s) without admin role:`);
      nonAdminUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.full_name || 'No name'}) - Current role: ${user.role || 'None'}`);
      });

      const firstUser = nonAdminUsers[0];
      firstUser.role = 'admin';
      await userRepository.save(firstUser);

      console.log(`\n✅ Successfully assigned admin role to: ${firstUser.email}`);

      if (nonAdminUsers.length > 1) {
        console.log(`\n⚠️  There are ${nonAdminUsers.length - 1} more user(s) without admin role.`);
        console.log(`   To assign admin role to a specific user, run: npm run assign:admin <email>`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    } finally {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
    }
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));

