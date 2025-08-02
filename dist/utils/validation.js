"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletActionSchema = exports.transactionSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Invalid email format"),
    phone: zod_1.z.string().min(11, "Phone must be at least 11 characters"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    role: zod_1.z.enum(["user", "agent"]).default("user"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.transactionSchema = zod_1.z.object({
    amount: zod_1.z.number().positive("Amount must be positive"),
    toWallet: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
exports.walletActionSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, "User ID is required"),
    amount: zod_1.z.number().positive("Amount must be positive"),
    description: zod_1.z.string().optional(),
});
