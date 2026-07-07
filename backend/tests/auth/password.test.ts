import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Password Reset Integration Tests', () => {
  beforeAll(async () => {
    await prisma.resetToken.deleteMany();
    await prisma.user.deleteMany();
    
    // Create a test user
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'passwordtest@example.com',
        password: 'password123',
        fullName: 'Password Test'
      });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/password/forgot', () => {
    it('should send reset password email (or simulate)', async () => {
      const response = await request(app)
        .post('/api/password/forgot')
        .send({ email: 'passwordtest@example.com' });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return success even for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/api/password/forgot')
        .send({ email: 'nonexistent@example.com' });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
