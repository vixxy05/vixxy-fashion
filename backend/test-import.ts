import { register, login, logout, refreshToken, getMe, updateProfile } from "./src/controllers/authController";
import { authenticate } from "./src/middleware/authMiddleware";

console.log("register:", typeof register);
console.log("login:", typeof login);
console.log("logout:", typeof logout);
console.log("refreshToken:", typeof refreshToken);
console.log("getMe:", typeof getMe);
console.log("updateProfile:", typeof updateProfile);
console.log("authenticate:", typeof authenticate);
