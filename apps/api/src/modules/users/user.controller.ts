import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/middleware/authenticate";
import * as userService from "./user.service";

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await userService.getUserProfile(userId);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role.name,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error("GetProfile controller error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { firstName, lastName, email, phoneNumber, dateOfBirth, avatarUrl } = req.body;

    if (!firstName) {
      return res.status(400).json({ error: "First name is required" });
    }

    const updatedUser = await userService.updateUserProfile(userId, {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      avatarUrl
    });

    if (!updatedUser) {
      return res.status(400).json({ error: "Failed to update profile" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role.name,
        profile: updatedUser.profile
      }
    });
  } catch (error: any) {
    console.error("UpdateProfile controller error:", error);
    const errorMessage = error?.message || "Internal server error";
    return res.status(400).json({ error: errorMessage });
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long" });
    }

    await userService.changePassword(userId, currentPassword, newPassword);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("ChangePassword controller error:", error);
    const errorMessage = error?.message || "Internal server error";
    return res.status(400).json({ error: errorMessage });
  }
}

export async function getRewards(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rewards = await userService.getUserRewards(userId);

    return res.status(200).json(rewards);
  } catch (error) {
    console.error("GetRewards controller error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getEcoImpact(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const ecoImpact = await userService.getUserEcoImpact(userId);

    return res.status(200).json(ecoImpact);
  } catch (error) {
    console.error("GetEcoImpact controller error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
