import { Request, Response } from "express";
import { 
  authenticateUser, 
  registerUser, 
  generatePasswordResetOtp, 
  generateEmailVerificationOtp,
  confirmOtp, 
  updatePasswordWithOtp 
} from "./auth.service";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const authResult = await authenticateUser(email, password);

    if (!authResult) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      token: authResult.token,
      accessToken: authResult.token,
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
        role: authResult.user.role.name,
        profile: authResult.user.profile
      }
    });
  } catch (error) {
    console.error("Login controller error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, fullName, phoneNumber } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Email, password, and full name are required" });
    }

    const registrationResult = await registerUser(email, password, fullName, phoneNumber);

    if (!registrationResult) {
      return res.status(400).json({ error: "Registration failed. Email might be already in use." });
    }

    return res.status(201).json({
      message: "Registration successful. Verification email sent.",
      token: registrationResult.token,
      user: {
        id: registrationResult.user.id,
        email: registrationResult.user.email,
        role: registrationResult.user.role.name,
        profile: registrationResult.user.profile
      }
    });
  } catch (error: any) {
    console.error("Register controller error:", error);
    const errorMessage = error?.message || "Internal server error";
    return res.status(400).json({ error: errorMessage });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const result = await generatePasswordResetOtp(email);
    if (!result) {
      return res.status(404).json({ error: "No account found with this email" });
    }
    return res.status(200).json({ message: "OTP sent successfully (Check backend console and your email for code)" });
  } catch (error: any) {
    console.error("ForgotPassword controller error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function sendVerificationOtp(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    await generateEmailVerificationOtp(email);
    return res.status(200).json({ message: "Verification OTP sent successfully (Check backend console and your email for code)" });
  } catch (error: any) {
    console.error("SendVerificationOtp controller error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }
    const isValid = await confirmOtp(email, otp);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired OTP code" });
    }
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error: any) {
    console.error("VerifyOtp controller error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required" });
    }
    const success = await updatePasswordWithOtp(email, otp, newPassword);
    if (!success) {
      return res.status(400).json({ error: "Password reset failed. Ensure OTP is verified." });
    }
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("ResetPassword controller error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

