import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

beforeAll(async () => {
  // Optional: Clear tables before tests or use a test database
  console.log('Test setup complete');
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Optional: Reset database between tests
beforeEach(async () => {
  // Uncomment this if you want to clear tables before each test
  // await prisma.resetToken.deleteMany();
  // await prisma.refreshToken.deleteMany();
  // await prisma.user.deleteMany();
});
