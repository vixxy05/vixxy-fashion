import jwt from "jsonwebtoken";
import crypto from "crypto";
import db from "../models";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-me-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export interface JWTTokenPayload {
  userId: number;
  email: string;
  roleName: string;
  roleId: number;
}

export default class JWTService {
  static generateAccessToken(user: any): string {
    const payload: JWTTokenPayload = {
      userId: user.id,
      email: user.email,
      roleName: user.role?.roleName || "CUSTOMER",
      roleId: user.roleId,
    };

    return jwt.sign(payload, JWT_SECRET as jwt.Secret, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  }

  static async generateRefreshToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.RefreshToken.create({
      userId,
      token,
      expiresAt,
      revoked: false,
    });

    return token;
  }

  static verifyAccessToken(token: string): JWTTokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTTokenPayload;
    } catch (error) {
      return null;
    }
  }

  static async verifyRefreshToken(token: string): Promise<any | null> {
    const refreshToken = await db.RefreshToken.findOne({
      where: { token, revoked: false },
      include: [{ model: db.User, as: "user" }],
    });

    if (!refreshToken) return null;
    if (refreshToken.expiresAt < new Date()) return null;

    return (refreshToken as any).user;
  }

  static async revokeRefreshToken(token: string): Promise<void> {
    await db.RefreshToken.update(
      { revoked: true },
      { where: { token } }
    );
  }

  static async revokeAllUserTokens(userId: number): Promise<void> {
    await db.RefreshToken.update(
      { revoked: true },
      { where: { userId } }
    );
  }
}
