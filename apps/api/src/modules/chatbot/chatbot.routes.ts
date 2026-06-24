import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import {
  handleMessage,
  handleGetHistory,
  handleDeleteHistory,
} from "./chatbot.controller";

const router = Router();

// POST /chatbot/message - Process message (JWT Protected)
router.post("/chatbot/message", authenticate, handleMessage);

// GET /chatbot/history - Retrieve message history (JWT Protected)
router.get("/chatbot/history", authenticate, handleGetHistory);

// DELETE /chatbot/history - Clear message history (JWT Protected)
router.delete("/chatbot/history", authenticate, handleDeleteHistory);

export default router;
