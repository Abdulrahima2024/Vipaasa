import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { getPayments } from "./payment.controller";

const router = Router();

router.get("/payments", authenticate, getPayments);

export default router;
