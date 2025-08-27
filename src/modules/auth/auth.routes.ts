import { Router } from "express"
import { register, login, logout, getProfile } from "./auth.controller"
import { authenticate } from "../../middlewares/auth"
import { validate } from "../../middlewares/validation"
import { registerSchema, loginSchema } from "../../utils/validation"
import { searchUserByName } from "../user/user.controller"

const router = Router()

router.post("/register", validate(registerSchema), register)
router.post("/login", validate(loginSchema), login)
router.post("/logout", logout)
router.get("/profile", authenticate, getProfile)
export default router