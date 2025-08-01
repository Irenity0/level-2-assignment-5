import type { Response } from "express"
import { User } from "../user/user.model"
import { Wallet } from "../wallet/wallet.model"
import { Transaction } from "../transaction/transaction.model"
import { sendResponse, sendError } from "../../utils/response"
import type { AuthRequest } from "../../types"

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await User.countDocuments({ role: { $ne: "admin" } })

    return sendResponse(res, 200, true, "Users retrieved successfully", {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return sendError(res, 500, "Failed to get users", error.message)
  }
}

export const getAllWallets = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const wallets = await Wallet.find()
      .populate("userId", "name email phone role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Wallet.countDocuments()

    return sendResponse(res, 200, true, "Wallets retrieved successfully", {
      wallets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return sendError(res, 500, "Failed to get wallets", error.message)
  }
}

export const getAllTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const transactions = await Transaction.find()
      .populate("initiatedBy", "name email role")
      .populate("fromWallet", "userId")
      .populate("toWallet", "userId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Transaction.countDocuments()

    return sendResponse(res, 200, true, "Transactions retrieved successfully", {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return sendError(res, 500, "Failed to get transactions", error.message)
  }
}

export const blockWallet = async (req: AuthRequest, res: Response) => {
  try {
    const { walletId } = req.params

    const wallet = await Wallet.findById(walletId)
    if (!wallet) {
      return sendError(res, 404, "Wallet not found")
    }

    wallet.isBlocked = true
    await wallet.save()

    return sendResponse(res, 200, true, "Wallet blocked successfully", {
      wallet: {
        id: wallet._id,
        isBlocked: wallet.isBlocked,
      },
    })
  } catch (error: any) {
    return sendError(res, 500, "Failed to block wallet", error.message)
  }
}

export const unblockWallet = async (req: AuthRequest, res: Response) => {
  try {
    const { walletId } = req.params

    const wallet = await Wallet.findById(walletId)
    if (!wallet) {
      return sendError(res, 404, "Wallet not found")
    }

    wallet.isBlocked = false
    await wallet.save()

    return sendResponse(res, 200, true, "Wallet unblocked successfully", {
      wallet: {
        id: wallet._id,
        isBlocked: wallet.isBlocked,
      },
    })
  } catch (error: any) {
    return sendError(res, 500, "Failed to unblock wallet", error.message)
  }
}

export const approveAgent = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return sendError(res, 404, "User not found")
    }

    if (user.role !== "agent") {
      return sendError(res, 400, "User is not an agent")
    }

    user.isApproved = true
    await user.save()

    return sendResponse(res, 200, true, "Agent approved successfully", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    })
  } catch (error: any) {
    return sendError(res, 500, "Failed to approve agent", error.message)
  }
}

export const suspendAgent = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return sendError(res, 404, "User not found")
    }

    if (user.role !== "agent") {
      return sendError(res, 400, "User is not an agent")
    }

    user.isApproved = false
    await user.save()

    return sendResponse(res, 200, true, "Agent suspended successfully", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    })
  } catch (error: any) {
    return sendError(res, 500, "Failed to suspend agent", error.message)
  }
}