import { Router } from "express";
import { login, register, forgotPassword, sendVerificationOtp, verifyOtp, resetPassword } from "./auth.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/send-verification-otp", sendVerificationOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
