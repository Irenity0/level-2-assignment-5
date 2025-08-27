import type { Response } from "express"
import { User } from "../user/user.model"
import { Wallet } from "../wallet/wallet.model"
import { Transaction } from "../transaction/transaction.model"
import { sendResponse, sendError } from "../../utils/response"
import type { AuthRequest } from "../../types"

// 📊 Overview
export const getOverview = async (_req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } })
    const totalAgents = await User.countDocuments({ role: "agent" })
    const totalTransactions = await Transaction.countDocuments()
    const totalVolumeAgg = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const totalVolume = totalVolumeAgg[0]?.total || 0

    return sendResponse(res, 200, true, "Overview retrieved successfully", {
      totalUsers,
      totalAgents,
      totalTransactions,
      totalVolume,
    })
  } catch (error: any) {
    return sendError(res, 500, "Failed to get overview", error.message)
  }
}

// 👤 Manage Users (with search, filter, pagination)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const search = (req.query.search as string) || ""
    const status = req.query.status as string // "blocked" | "active"

    const filter: Record<string, any> = { role: { $ne: "admin" } }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ]
    }

    if (status) {
      const wallets = await Wallet.find({ isBlocked: status === "blocked" })
      filter._id = { $in: wallets.map((w) => w.userId) }
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await User.countDocuments(filter)

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

// 🚫 Block User
export const blockUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return sendError(res, 404, "User not found")
    }

    // Deactivate user
    user.isActive = false
    await user.save()

    // Block all wallets for this user
    await Wallet.updateMany({ userId }, { isBlocked: true })

    return sendResponse(res, 200, true, "User blocked successfully", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    })
  } catch (error: any) {
    return sendError(res, 500, "Failed to block user", error.message)
  }
}

// ✅ Unblock User
export const unblockUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return sendError(res, 404, "User not found")
    }

    // Reactivate user
    user.isActive = true
    await user.save()

    // Unblock all wallets for this user
    await Wallet.updateMany({ userId }, { isBlocked: false })

    return sendResponse(res, 200, true, "User unblocked successfully", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    })
  } catch (error: any) {
    return sendError(res, 500, "Failed to unblock user", error.message)
  }
}


// 👛 Manage Wallets (with search + filter)
export const getAllWallets = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const search = (req.query.search as string) || ""
    const isBlocked = req.query.isBlocked as string // "true" | "false"

    const filter: Record<string, any> = {}
    if (isBlocked) filter.isBlocked = isBlocked === "true"

    const wallets = await Wallet.find(filter)
      .populate("userId", "name email phone role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    if (search) {
      // Apply search on populated fields
      wallets.filter((w: any) =>
        [w.userId?.name, w.userId?.email, w.userId?.phone]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    }

    const total = await Wallet.countDocuments(filter)

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

// 💸 Transactions with advanced filters
export const getAllTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const { type, status, minAmount, maxAmount, startDate, endDate, search } =
      req.query

    const filter: Record<string, any> = {}

    if (type) filter.type = type
    if (status) filter.status = status
    if (minAmount || maxAmount) {
      filter.amount = {}
      if (minAmount) filter.amount.$gte = Number(minAmount)
      if (maxAmount) filter.amount.$lte = Number(maxAmount)
    }
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate as string)
      if (endDate) filter.createdAt.$lte = new Date(endDate as string)
    }

    if (search) {
      // fuzzy search in user names/emails through population
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      })
      filter.$or = [
        { initiatedBy: { $in: users.map((u) => u._id) } },
        { "fromWallet.userId": { $in: users.map((u) => u._id) } },
        { "toWallet.userId": { $in: users.map((u) => u._id) } },
      ]
    }

    const transactions = await Transaction.find(filter)
      .populate("initiatedBy", "name email role")
      .populate({ path: "fromWallet", populate: { path: "userId", select: "name email" } })
      .populate({ path: "toWallet", populate: { path: "userId", select: "name email" } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Transaction.countDocuments(filter)

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