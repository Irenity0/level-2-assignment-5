import { Router } from "express"
import { getWallet, addMoney, withdraw, sendMoney, cashIn, cashOut } from "./wallet.controller"
import { authenticate, authorize } from "../../middlewares/auth"
import { validate } from "../../middlewares/validation"
import { transactionSchema, walletActionSchema } from "../../utils/validation"

const router = Router()

// User routes
router.get("/", authenticate, authorize("user", "agent"), getWallet)
router.post("/add-money", authenticate, authorize("user"), validate(transactionSchema), addMoney)
router.post("/withdraw", authenticate, authorize("user"), validate(transactionSchema), withdraw)
router.post("/send-money", authenticate, authorize("user"), validate(transactionSchema), sendMoney)

// Agent routes
router.post("/cash-in", authenticate, authorize("agent"), validate(walletActionSchema), cashIn)
router.post("/cash-out", authenticate, authorize("agent"), validate(walletActionSchema), cashOut)

export default router