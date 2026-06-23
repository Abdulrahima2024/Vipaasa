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

export async function getAddresses(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const profile = await userService.getUserAddressesAndProfile(userId);
    const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "Customer User";

    const mapped = profile.addresses.map(addr => ({
      id: addr.id,
      type: addr.addressType === "HOME" ? "Home" : addr.addressType === "WORK" ? "Work" : "Other",
      name: fullName,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone || "",
      isDefault: addr.isDefault
    }));

    return res.status(200).json({ status: "success", data: mapped });
  } catch (error) {
    console.error("GetAddresses controller error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createAddress(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { type, addressType: bodyAddressType, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault } = req.body;

    const rawType = bodyAddressType || type;
    const addressType = (rawType === "Home" || rawType === "HOME") ? "HOME" : (rawType === "Work" || rawType === "WORK") ? "WORK" : "SHIPPING";

    if (!addressLine1 || !city || !state || !postalCode || !country) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    const newAddress = await userService.createUserAddress(userId, {
      addressType,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault
    });

    const user = await userService.getUserProfile(userId);
    const fullName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}`.trim() : "Customer User";

    return res.status(201).json({
      status: "success",
      data: {
        id: newAddress.id,
        type: newAddress.addressType === "HOME" ? "Home" : newAddress.addressType === "WORK" ? "Work" : "Other",
        name: fullName,
        addressLine1: newAddress.addressLine1,
        addressLine2: newAddress.addressLine2 || "",
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.postalCode,
        country: newAddress.country,
        phone: newAddress.phone || "",
        isDefault: newAddress.isDefault
      }
    });
  } catch (error: any) {
    console.error("CreateAddress controller error:", error);
    return res.status(400).json({ error: error.message || "Bad request" });
  }
}

export async function updateAddress(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { type, addressType: bodyAddressType, addressLine1, addressLine2, city, state, postalCode, country, phone, isDefault } = req.body;

    const rawType = bodyAddressType || type;
    let addressType: "HOME" | "WORK" | "SHIPPING" | undefined = undefined;
    if (rawType) {
      addressType = (rawType === "Home" || rawType === "HOME") ? "HOME" : (rawType === "Work" || rawType === "WORK") ? "WORK" : "SHIPPING";
    }

    const updatedAddress = await userService.updateUserAddress(userId, id, {
      addressType,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault
    });

    const user = await userService.getUserProfile(userId);
    const fullName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}`.trim() : "Customer User";

    return res.status(200).json({
      status: "success",
      data: {
        id: updatedAddress.id,
        type: updatedAddress.addressType === "HOME" ? "Home" : updatedAddress.addressType === "WORK" ? "Work" : "Other",
        name: fullName,
        addressLine1: updatedAddress.addressLine1,
        addressLine2: updatedAddress.addressLine2 || "",
        city: updatedAddress.city,
        state: updatedAddress.state,
        postalCode: updatedAddress.postalCode,
        country: updatedAddress.country,
        phone: updatedAddress.phone || "",
        isDefault: updatedAddress.isDefault
      }
    });
  } catch (error: any) {
    console.error("UpdateAddress controller error:", error);
    return res.status(400).json({ error: error.message || "Bad request" });
  }
}


export async function deleteAddress(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    await userService.deleteUserAddress(userId, id);

    return res.status(200).json({ status: "success", message: "Address deleted successfully" });
  } catch (error: any) {
    console.error("DeleteAddress controller error:", error);
    return res.status(400).json({ error: error.message || "Bad request" });
  }
}

export async function getAllUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const mappedUsers = await userService.getAllUsers();
    return res.status(200).json(mappedUsers);
  } catch (error) {
    console.error("GetAllUsers controller error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createSystemUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, name, status, permissions } = req.body;
    if (!email || !name || !status) {
      return res.status(400).json({ error: "email, name, and status are required" });
    }

    const newUser = await userService.createSystemUser({ email, name, status, permissions });
    return res.status(201).json({
      status: "success",
      message: "System user created successfully",
      data: newUser
    });
  } catch (error: any) {
    console.error("CreateSystemUser controller error:", error);
    return res.status(400).json({ error: error.message || "Bad request" });
  }
}

export async function updateSystemUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { email, name, status, permissions } = req.body;
    if (!email || !name || !status) {
      return res.status(400).json({ error: "email, name, and status are required" });
    }

    const updatedUser = await userService.updateSystemUser(id, { email, name, status, permissions });
    return res.status(200).json({
      status: "success",
      message: "System user updated successfully",
      data: updatedUser
    });
  } catch (error: any) {
    console.error("UpdateSystemUser controller error:", error);
    return res.status(400).json({ error: error.message || "Bad request" });
  }
}

export async function deleteSystemUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await userService.deleteSystemUser(id);
    return res.status(200).json({
      status: "success",
      message: "System user deleted successfully"
    });
  } catch (error: any) {
    console.error("DeleteSystemUser controller error:", error);
    return res.status(400).json({ error: error.message || "Bad request" });
  }
}

export async function getUserOrdersHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const result = await userService.getUserOrders(id, page, limit);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("GetUserOrdersHandler controller error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}


export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await userService.getUsersDashboardStats();
    return res.status(200).json(stats);
  } catch (error) {
    console.error("GetDashboardStats controller error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
