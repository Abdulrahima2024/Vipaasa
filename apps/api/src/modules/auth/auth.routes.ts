import { Router } from "express";
import { login, register, forgotPassword, sendVerificationOtp, verifyOtp, resetPassword, refresh, logout } from "./auth.controller";
import { createRedisRateLimiter } from "../../shared/middleware/rateLimit.middleware";
import { validateCaptcha } from "../../shared/middleware/captcha.middleware";

const router = Router();

const loginLimiter = createRedisRateLimiter({
  windowSeconds: 60,
  maxRequests: 5,
  keyPrefix: "login",
});

const registerLimiter = createRedisRateLimiter({
  windowSeconds: 60,
  maxRequests: 5,
  keyPrefix: "register",
});

const forgotPasswordLimiter = createRedisRateLimiter({
  windowSeconds: 60,
  maxRequests: 3,
  keyPrefix: "forgot-password",
});

router.post("/login", validateCaptcha, loginLimiter, login);
router.post("/register", validateCaptcha, registerLimiter, register);
router.post("/forgot-password", validateCaptcha, forgotPasswordLimiter, forgotPassword);
router.post("/send-verification-otp", sendVerificationOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refresh);
router.post("/logout", logout);

export default router;
