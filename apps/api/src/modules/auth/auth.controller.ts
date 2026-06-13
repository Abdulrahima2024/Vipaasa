import { Request, Response } from "express";
import { authenticateUser, registerUser } from "./auth.service";

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
      message: "Registration successful",
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

