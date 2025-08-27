// backend/src/api/user/user.routes.ts
import { Router } from "express";
import { searchUserByName, updateUserProfile } from "./user.controller";
import { authenticate, authorize } from "../../middlewares/auth";

const router = Router();

router.get("/search", authenticate, searchUserByName);
router.put("/update", authenticate, authorize("user", "agent", "admin"), updateUserProfile);

export default router;