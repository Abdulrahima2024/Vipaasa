import { Router } from "express";
import multer from "multer";
import { organicController } from "./organic.controller";

const router = Router();

// Configure multer to store files in memory as Buffers
// so we can directly upload them to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.get("/organics", organicController.getAll);
router.post("/organics", upload.single("image"), organicController.create);
router.put("/organics/:id", upload.single("image"), organicController.update);
router.delete("/organics/:id", organicController.delete);

export default router;
