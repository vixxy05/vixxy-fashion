import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import db from "../models";
import { AuthRequest } from "../middleware/authMiddleware";
import JWTService from "../services/JWTService";
import AuditLogService from "../services/AuditLogService";
import { emailService } from "../services/email.service";

const RESET_TOKEN_EXPIRY_HOURS = 1;

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc!",
      });
    }

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const customerRole = await db.Role.findOne({
      where: { roleName: "CUSTOMER" },
    });
    if (!customerRole) {
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống: không tìm thấy role customer!",
      });
    }

    const user = await db.User.create({
      email,
      passwordHash: hashedPassword,
      fullName,
      phone,
      roleId: customerRole.id,
      status: "active",
      emailVerified: false,
      phoneVerified: false,
    });

    const userWithoutPassword = user.toJSON();
    delete (userWithoutPassword as any).passwordHash;

    await AuditLogService.createLog(
      user.id,
      "REGISTER",
      "USER",
      user.id,
      null,
      userWithoutPassword,
      req.ip,
      req.get("user-agent")
    );

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công!",
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau!",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    const user = await db.User.findOne({
      where: { email },
      include: [{ model: db.Role, as: "role" }],
    });

    if (!user) {
      await db.LoginHistory.create({
        userId: 0,
        ipAddress,
        deviceInfo: userAgent,
        browserInfo: userAgent,
        success: false,
        failureReason: "User not found",
      });
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    if (user.status !== "active") {
      await db.LoginHistory.create({
        userId: user.id,
        ipAddress,
        deviceInfo: userAgent,
        browserInfo: userAgent,
        success: false,
        failureReason: "Account not active",
      });
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa!",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await db.LoginHistory.create({
        userId: user.id,
        ipAddress,
        deviceInfo: userAgent,
        browserInfo: userAgent,
        success: false,
        failureReason: "Invalid password",
      });
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng!",
      });
    }

    await user.update({ lastLoginAt: new Date() });

    await db.LoginHistory.create({
      userId: user.id,
      ipAddress,
      deviceInfo: userAgent,
      browserInfo: userAgent,
      success: true,
    });

    const accessToken = JWTService.generateAccessToken(user);
    const refreshToken = await JWTService.generateRefreshToken(user.id);

    const userWithoutPassword = user.toJSON();
    delete (userWithoutPassword as any).passwordHash;

    await AuditLogService.createLog(
      user.id,
      "LOGIN",
      "USER",
      user.id,
      null,
      { userId: user.id, email: user.email, ip: ipAddress },
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      data: {
        accessToken,
        refreshToken,
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau!",
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp refresh token!",
      });
    }

    const user = await JWTService.verifyRefreshToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Refresh token không hợp lệ hoặc đã hết hạn!",
      });
    }

    await JWTService.revokeRefreshToken(token);
    const newAccessToken = JWTService.generateAccessToken(user);
    const newRefreshToken = await JWTService.generateRefreshToken(user.id);

    res.json({
      success: true,
      message: "Token đã được làm mới!",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau!",
    });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await JWTService.revokeRefreshToken(refreshToken);
    }

    if (req.user) {
      await AuditLogService.createLog(
        req.user.id,
        "LOGOUT",
        "USER",
        req.user.id,
        null,
        null,
        req.ip,
        req.get("user-agent")
      );
    }

    res.json({
      success: true,
      message: "Đăng xuất thành công!",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau!",
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập!",
      });
    }

    const user = await db.User.findByPk(req.user.id, {
      include: [{ model: db.Role, as: "role" }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    const userWithoutPassword = user.toJSON();
    delete (userWithoutPassword as any).passwordHash;

    res.json({
      success: true,
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau!",
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phone, avatar, birthday, gender, address } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập!",
      });
    }

    const user = await db.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    const oldData = user.toJSON();
    delete (oldData as any).passwordHash;

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (birthday) updateData.birthday = new Date(birthday);
    if (gender) updateData.gender = gender;
    if (address !== undefined) updateData.address = address;

    await user.update(updateData);

    const newData = user.toJSON();
    delete (newData as any).passwordHash;

    await AuditLogService.createLog(
      user.id,
      "UPDATE_PROFILE",
      "USER",
      user.id,
      oldData,
      newData,
      req.ip,
      req.get("user-agent")
    );

    res.json({
      success: true,
      message: "Cập nhật thông tin thành công!",
      data: { user: newData },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau!",
    });
  }
};

/**
 * Forgot Password - Send reset link to email (Sequelize version)
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp email!",
      });
    }

    // Find user by email
    const user = await db.User.findOne({ where: { email } });

    // Even if user doesn't exist, return success to prevent email enumeration attacks
    if (!user) {
      return res.json({
        success: true,
        message: "Nếu email đã được đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu",
      });
    }

    // Revoke all existing tokens
    await db.ResetToken.update(
      { used: true },
      { where: { userId: user.id, used: false } }
    );

    // Generate new reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await db.ResetToken.create({
      userId: user.id,
      token,
      expiresAt,
      used: false,
    });

    // Send email
    await emailService.sendPasswordResetEmail(user.email, user.fullName, token);

    return res.json({
      success: true,
      message: "Nếu email đã được đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau!",
    });
  }
};

/**
 * Reset Password - Use token to set new password (Sequelize version)
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự!",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu và xác nhận mật khẩu không khớp!",
      });
    }

    // Find reset token
    const resetToken = await db.ResetToken.findOne({
      where: { token },
      include: [{ model: db.User, as: "user" }],
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ!",
      });
    }

    if (resetToken.used) {
      return res.status(400).json({
        success: false,
        message: "Token đã được sử dụng!",
      });
    }

    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Token đã hết hạn!",
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    await db.User.update(
      { passwordHash },
      { where: { id: resetToken.userId } }
    );

    // Mark token as used
    await resetToken.update({ used: true });

    return res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công!",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau!",
    });
  }
};
