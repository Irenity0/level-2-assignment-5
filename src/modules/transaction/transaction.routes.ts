import { Router } from "express"
import { getTransactionHistory, getCommissionHistory } from "./transaction.controller"
import { authenticate, authorize } from "../../middlewares/auth"

const router = Router()

router.get("/history", authenticate, authorize("user", "agent"), getTransactionHistory)
router.get("/commission", authenticate, authorize("agent"), getCommissionHistory)

export default router