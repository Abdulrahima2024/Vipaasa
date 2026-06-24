import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../shared/middleware/authenticate";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getRewards,
  getEcoImpact,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  createSystemUser,
  updateSystemUser,
  deleteSystemUser,
  getUserOrdersHandler,
  getDashboardStats
} from "./user.controller";

const router = Router();

// Configure multer memory storage with size and type constraints
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, JPG, and PNG are allowed."));
    }
  },
});

// ─── Named/specific routes MUST come before /:id wildcard ───────────────────
router.get("/dashboard-stats", authenticate, getDashboardStats);

// Current user profile
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

// Dedicated endpoint for production binary profile photo S3 uploads
router.post(
  "/profile/avatar",
  authenticate,
  (req, res, next) => {
    upload.single("avatar")(req, res, (err) => {
      if (err) {
        // Handle multer-specific errors (size limit or custom validation)
        const errorMsg = err.code === "LIMIT_FILE_SIZE" 
          ? "File size exceeds the 2MB limit. Please upload a smaller image."
          : err.message || "File upload failed.";
        return res.status(400).json({ error: errorMsg });
      }
      next();
    });
  },
  uploadAvatar
);

router.post("/change-password", authenticate, changePassword);
router.get("/rewards", authenticate, getRewards);
router.get("/eco-impact", authenticate, getEcoImpact);

// Addresses management
router.get("/addresses", authenticate, getAddresses);
router.post("/addresses", authenticate, createAddress);
router.put("/addresses/:id", authenticate, updateAddress);
router.delete("/addresses/:id", authenticate, deleteAddress);

// ─── Wildcard /:id routes (admin/system user management) — must be LAST ─────
router.get("/", authenticate, getAllUsers);
router.post("/", authenticate, createSystemUser);
router.put("/:id", authenticate, updateSystemUser);
router.delete("/:id", authenticate, deleteSystemUser);
router.get("/:id/orders", authenticate, getUserOrdersHandler);

export default router;


