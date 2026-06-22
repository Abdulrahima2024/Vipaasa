import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { listCustomers, getCustomerDetail } from "./customer.controller";

const router = Router();

router.get("/admin/customers", authenticate, authorize(["SUPER_ADMIN", "ADMIN", "STORE_EXECUTIVE"]), listCustomers);
router.get("/admin/customers/:id", authenticate, authorize(["SUPER_ADMIN", "ADMIN", "STORE_EXECUTIVE"]), getCustomerDetail);

export default router;
