import jwt, { SignOptions } from 'jsonwebtoken';

export interface JwtPayload {
  userId: number;
  email: string;
  roleName: string;
}

export class JwtService {
  private accessTokenSecret: string;
  private accessTokenExpiresIn: string;
  private refreshTokenSecret?: string;
  private refreshTokenExpiresIn?: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'your-super-secret-access-key';
    this.accessTokenExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || this.accessTokenSecret;
    this.refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  generateAccessToken(payload: JwtPayload): string {
    const options: SignOptions = {
      expiresIn: this.accessTokenExpiresIn as any,
    };
    return jwt.sign(payload, this.accessTokenSecret, options);
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.accessTokenSecret) as JwtPayload;
  }

  generateRefreshToken(payload: JwtPayload): string {
    const options: SignOptions = {
      expiresIn: this.refreshTokenExpiresIn as any,
    };
    return jwt.sign(payload, this.refreshTokenSecret!, options);
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.refreshTokenSecret!) as JwtPayload;
  }
}
