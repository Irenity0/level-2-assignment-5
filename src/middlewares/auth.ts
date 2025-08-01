import type { Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { User } from "../modules/user/user.model"
import type { AuthRequest } from "../types"
import { sendError } from "../utils/response"

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.token

    if (!token) {
      return sendError(res, 401, "Access denied. No token provided.")
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await User.findById(decoded.id)

    if (!user || !user.isActive) {
      return sendError(res, 401, "Invalid token or user not active.")
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    }

    next()
  } catch (error) {
    return sendError(res, 401, "Invalid token.")
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, "Authentication required.")
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, "Access denied. Insufficient permissions.")
    }

    next()
  }
}