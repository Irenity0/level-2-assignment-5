import type { Response } from "express"
import { sendResponse, sendError } from "../../utils/response"
import type { AuthRequest } from "../../types"
import { Transaction } from "./transaction.model"

export const getTransactionHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const transactions = await Transaction.find({
      $or: [{ initiatedBy: userId }, { fromWallet: { $exists: true } }, { toWallet: { $exists: true } }],
    })
      .populate("fromWallet", "userId")
      .populate("toWallet", "userId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Transaction.countDocuments({
      $or: [{ initiatedBy: userId }, { fromWallet: { $exists: true } }, { toWallet: { $exists: true } }],
    })

    return sendResponse(res, 200, true, "Transaction history retrieved successfully", {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return sendError(res, 500, "Failed to get transaction history", error.message)
  }
}

export const getCommissionHistory = async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user!.id
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const transactions = await Transaction.find({
      initiatedBy: agentId,
      type: { $in: ["cash_in", "cash_out"] },
      commission: { $gt: 0 },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Transaction.countDocuments({
      initiatedBy: agentId,
      type: { $in: ["cash_in", "cash_out"] },
      commission: { $gt: 0 },
    })

    const totalCommission = await Transaction.aggregate([
      {
        $match: {
          initiatedBy: agentId,
          type: { $in: ["cash_in", "cash_out"] },
          commission: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$commission" },
        },
      },
    ])

    return sendResponse(res, 200, true, "Commission history retrieved successfully", {
      transactions,
      totalCommission: totalCommission[0]?.totalCommission || 0,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    return sendError(res, 500, "Failed to get commission history", error.message)
  }
}