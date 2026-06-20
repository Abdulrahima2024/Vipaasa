import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail, getOtpEmailTemplate } from "../notifications/email.service";
import { prisma } from "../../config/database";
import * as otpService from "./otp.service";
import { generateAccessToken, generateRefreshToken, storeRefreshToken } from "./token.service";

export async function authenticateUser(email: string, password_raw: string) {
  // Find active user by email and fetch profile and role details
  const user = await prisma.user.findFirst({
    where: {
      email,
      isDeleted: false
    },
    include: {
      role: true,
      profile: true
    }
  });

  if (!user) {
    return null;
  }

  // Compare passwords
  const passwordMatch = await bcrypt.compare(password_raw, user.passwordHash);
  if (!passwordMatch) {
    return null;
  }

  // Generate Access and Refresh tokens
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role.name,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token
  const decoded = jwt.decode(refreshToken) as { exp: number };
  const expiresAt = decoded ? new Date(decoded.exp * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await storeRefreshToken(user.id, refreshToken, expiresAt);

  return { accessToken, refreshToken, user };
}

export async function generatePasswordResetOtp(email: string) {
  const user = await prisma.user.findFirst({
    where: { email, isDeleted: false }
  });
  if (!user) return null;

  // Generate 6-digit random code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(otp, 10);

  // Save via OTP service (automatically uses Redis or falls back to DB)
  await otpService.saveOtp(email, codeHash, "PASSWORD_RESET", user.id);

  // Log OTP code directly to terminal console for local developer check
  console.log(`\n========================================`);
  console.log(`[PASSWORD RESET OTP] Generated for: ${email}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`========================================\n`);

  // Send email to user
  const emailHtml = getOtpEmailTemplate(otp, "reset");
  await sendEmail({
    to: email,
    subject: "Reset Your Password - Vipaasa Organics",
    html: emailHtml,
  });

  return true;
}

export async function generateEmailVerificationOtp(email: string) {
  // Check if active user exists with this email
  const user = await prisma.user.findFirst({
    where: { email, isDeleted: false }
  });

  // Generate 6-digit random code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(otp, 10);

  // Save via OTP service (automatically uses Redis or falls back to DB)
  await otpService.saveOtp(email, codeHash, "EMAIL_VERIFICATION", user?.id || null);

  // Log OTP code directly to terminal console for local developer check
  console.log(`\n========================================`);
  console.log(`[EMAIL VERIFICATION OTP] Generated for: ${email}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`========================================\n`);

  // Send email to user
  const emailHtml = getOtpEmailTemplate(otp, "verification");
  await sendEmail({
    to: email,
    subject: "Verify Your Account - Vipaasa Organics",
    html: emailHtml,
  });

  return true;
}

export async function confirmOtp(email: string, otp: string) {
  // Try verifying PASSWORD_RESET first
  let verified = await otpService.verifyOtpCode(email, otp, "PASSWORD_RESET");
  if (!verified) {
    // Try verifying EMAIL_VERIFICATION
    verified = await otpService.verifyOtpCode(email, otp, "EMAIL_VERIFICATION");
  }
  return verified;
}

export async function updatePasswordWithOtp(
  email: string,
  otp: string,
  password_raw: string
) {
  // Verify and consume verified OTP state (one-time use)
  const isVerified = await otpService.consumeVerifiedOtp(email, "PASSWORD_RESET");
  if (!isVerified) return false;

  // Hash new password
  const passwordHash = await bcrypt.hash(password_raw, 10);

  // Update password in user record
  await prisma.user.update({
    where: { email },
    data: { passwordHash }
  });

  return true;
}

export async function registerUser(
  email: string,
  password_raw: string,
  fullName: string,
  phoneNumber?: string
) {
  // Check if email already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      isDeleted: false
    }
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
  }

  // Check if phone number already exists
  if (phoneNumber) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phoneNumber,
        isDeleted: false
      }
    });
    if (existingPhone) {
      throw new Error("An account with this phone number already exists");
    }
  }

  // Fetch standard CUSTOMER role
  const customerRole = await prisma.role.findFirst({
    where: {
      name: "CUSTOMER"
    }
  });

  if (!customerRole) {
    throw new Error("Default Customer role could not be resolved");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password_raw, 10);

  // Split full name
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Create user and profile in transaction
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      phoneNumber: phoneNumber || null,
      roleId: customerRole.id,
      profile: {
        create: {
          firstName,
          lastName
        }
      }
    },
    include: {
      role: true,
      profile: true
    }
  });

  // Send verification code upon registration
  try {
    await generateEmailVerificationOtp(email);
  } catch (error) {
    console.error("Failed to generate/send registration verification OTP:", error);
  }

  // Generate Access and Refresh tokens
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role.name,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token
  const decoded = jwt.decode(refreshToken) as { exp: number };
  const expiresAt = decoded ? new Date(decoded.exp * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await storeRefreshToken(user.id, refreshToken, expiresAt);

  return { accessToken, refreshToken, user };
}




