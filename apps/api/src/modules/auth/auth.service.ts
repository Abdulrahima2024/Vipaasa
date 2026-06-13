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

