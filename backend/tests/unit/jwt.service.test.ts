import { JwtService } from '../../src/services/jwt.service';

describe('JwtService Unit Tests', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService();
  });

  describe('Token Generation', () => {
    it('should generate access token with correct payload', () => {
      const payload = { userId: 1, email: 'test@example.com', roleName: 'CUSTOMER' };
      const token = jwtService.generateAccessToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should generate refresh token', () => {
      const payload = { userId: 1, email: 'test@example.com', roleName: 'CUSTOMER' };
      const token = jwtService.generateRefreshToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('Token Verification', () => {
    it('should verify valid access token', () => {
      const payload = { userId: 1, email: 'test@example.com', roleName: 'CUSTOMER' };
      const token = jwtService.generateAccessToken(payload);
      const decoded = jwtService.verifyAccessToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should verify valid refresh token', () => {
      const payload = { userId: 1, email: 'test@example.com', roleName: 'CUSTOMER' };
      const token = jwtService.generateRefreshToken(payload);
      const decoded = jwtService.verifyRefreshToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        jwtService.verifyAccessToken('invalid-token');
      }).toThrow();
    });
  });
});
