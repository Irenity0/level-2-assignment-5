import mongoose, { Schema } from "mongoose"
import type { IWallet } from "../../types"

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      unique: true,
      ref: "User",
    },
    balance: {
      type: Number,
      default: 50, // Initial balance 50tk
      min: [0, "Balance cannot be negative"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

export const Wallet = mongoose.model<IWallet>("Wallet", walletSchema)
