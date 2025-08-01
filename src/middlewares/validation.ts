import type { Request, Response, NextFunction } from "express"
import type { ZodSchema } from "zod"
import { sendError } from "../utils/response"

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || "Validation failed"
      return sendError(res, 400, errorMessage)
    }
  }
}
