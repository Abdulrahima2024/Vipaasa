import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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

  // Generate JWT token
  const secret = process.env.JWT_ACCESS_SECRET || "vipaasa_default_jwt_access_secret_key_1234567890";
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role.name
    },
    secret,
    { expiresIn: "1d" } // 1 day token
  );

  return { token, user };
}

export async function generatePasswordResetOtp(email: string) {
  const user = await prisma.user.findFirst({
    where: { email, isDeleted: false }
  });
  if (!user) return null;

  // Generate 6-digit random code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Delete previous reset OTPs for this email to prevent spam/clutter
  await prisma.otpVerification.deleteMany({
    where: { email, purpose: "PASSWORD_RESET" }
  });

  // Create new OTP verification record
  await prisma.otpVerification.create({
    data: {
      userId: user.id,
      email,
      codeHash,
      purpose: "PASSWORD_RESET",
      expiresAt,
      isVerified: false
    }
  });

  // Log OTP code directly to terminal console for local developer check
  console.log(`\n========================================`);
  console.log(`[PASSWORD RESET OTP] Generated for: ${email}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`Expires At: ${expiresAt.toISOString()}`);
  console.log(`========================================\n`);

  return true;
}

export async function confirmOtp(email: string, otp: string) {
  const verification = await prisma.otpVerification.findFirst({
    where: {
      email,
      purpose: "PASSWORD_RESET",
      isVerified: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: "desc" }
  });

  if (!verification) return false;

  const matches = await bcrypt.compare(otp, verification.codeHash);
  if (!matches) return false;

  // Mark verification record as verified
  await prisma.otpVerification.update({
    where: { id: verification.id },
    data: { isVerified: true }
  });

  return true;
}

export async function updatePasswordWithOtp(
  email: string,
  otp: string,
  password_raw: string
) {
  // Confirm that a verified OTP exists for this email
  const verification = await prisma.otpVerification.findFirst({
    where: {
      email,
      purpose: "PASSWORD_RESET",
      isVerified: true
    },
    orderBy: { updatedAt: "desc" }
  });

  if (!verification) return false;

  // Hash new password
  const passwordHash = await bcrypt.hash(password_raw, 10);

  // Update password in user record
  await prisma.user.update({
    where: { email },
    data: { passwordHash }
  });

  // Clean up all reset OTPs for this user
  await prisma.otpVerification.deleteMany({
    where: { email, purpose: "PASSWORD_RESET" }
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

  // Generate JWT token
  const secret = process.env.JWT_ACCESS_SECRET || "vipaasa_default_jwt_access_secret_key_1234567890";
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role.name
    },
    secret,
    { expiresIn: "1d" }
  );

  return { token, user };
}




