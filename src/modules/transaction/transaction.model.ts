import mongoose, { Schema } from "mongoose"
import type { ITransaction } from "../../types"

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ["add_money", "withdraw", "send_money", "cash_in", "cash_out"],
      required: [true, "Transaction type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    fee: {
      type: Number,
      default: 0,
      min: [0, "Fee cannot be negative"],
    },
    commission: {
      type: Number,
      default: 0,
      min: [0, "Commission cannot be negative"],
    },
    fromWallet: {
      type: String,
      ref: "Wallet",
    },
    toWallet: {
      type: String,
      ref: "Wallet",
    },
    initiatedBy: {
      type: String,
      required: [true, "Initiator is required"],
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "reversed"],
      default: "pending",
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

export const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema)
