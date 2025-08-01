import { Router } from "express"
import {
  getAllUsers,
  getAllWallets,
  getAllTransactions,
  blockWallet,
  unblockWallet,
  approveAgent,
  suspendAgent,
} from "./admin.controller"
import { authenticate, authorize } from "../../middlewares/auth"

const router = Router()

router.get("/users", authenticate, authorize("admin"), getAllUsers)
router.get("/wallets", authenticate, authorize("admin"), getAllWallets)
router.get("/transactions", authenticate, authorize("admin"), getAllTransactions)

router.patch("/wallets/:walletId/block", authenticate, authorize("admin"), blockWallet)
router.patch("/wallets/:walletId/unblock", authenticate, authorize("admin"), unblockWallet)

router.patch("/agents/:userId/approve", authenticate, authorize("admin"), approveAgent)
router.patch("/agents/:userId/suspend", authenticate, authorize("admin"), suspendAgent)

export default router