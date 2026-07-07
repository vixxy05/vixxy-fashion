import { Request, Response, NextFunction } from "express";
import db from "../models";
import JWTService from "../services/JWTService";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng cung cấp token xác thực!",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = JWTService.verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn!",
      });
    }

    const user = await db.User.findByPk(decoded.userId, {
      include: [{ model: db.Role, as: "role" }],
    });

    if (!user || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại hoặc đã bị khóa!",
      });
    }

    const userWithoutPassword = user.toJSON();
    delete (userWithoutPassword as any).passwordHash;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Xác thực thất bại!",
    });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập!",
      });
    }

    const userRoleName = req.user.role?.roleName;
    if (!allowedRoles.includes(userRoleName)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập vào tài nguyên này!",
      });
    }

    next();
  };
};
