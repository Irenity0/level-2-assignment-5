import type { Request } from "express"
import type { Document } from "mongoose"

export interface IUser extends Document {
  _id: string
  name: string
  email: string
  phone: string
  password: string
  role: "user" | "agent" | "admin"
  isActive: boolean
  isApproved: boolean // agent er
  createdAt: Date
  updatedAt: Date
    comparePassword(candidatePassword: string): Promise<boolean>
}

export interface IWallet extends Document {
  _id: string
  userId: string
  balance: number
  isBlocked: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ITransaction extends Document {
  _id: string
  type: "add_money" | "withdraw" | "send_money" | "cash_in" | "cash_out"
  amount: number
  fee: number
  commission: number
  fromWallet?: string
  toWallet?: string
  initiatedBy: string
  status: "pending" | "completed" | "failed" | "reversed"
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthRequest extends Request {
  user?: {
    id: string
    role: string
    email: string
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}