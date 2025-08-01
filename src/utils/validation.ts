import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(11, "Phone must be at least 11 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "agent"]).default("user"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})

export const transactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  toWallet: z.string().optional(),
  description: z.string().optional(),
})

export const walletActionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
})