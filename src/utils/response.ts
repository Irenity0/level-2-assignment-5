import { ApiResponse } from "../types"
import type { Response } from "express"

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T
): Response => {
  const response: ApiResponse<T> = {
    success,
    message,
    ...(data && { data })
  }

  return res.status(statusCode).json(response)
}

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error?: string
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(error && { error })
  }

  return res.status(statusCode).json(response)
}