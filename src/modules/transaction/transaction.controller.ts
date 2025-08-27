import type { Response } from "express";
import { sendResponse, sendError } from "../../utils/response";
import type { AuthRequest } from "../../types";
import { Transaction } from "./transaction.model";

export const getTransactionHistory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get filters from query
    const { type, startDate, endDate } = req.query;

    // Build the query
    const query: any = {
      $or: [
        { initiatedBy: userId },
        { "fromWallet.userId": userId },
        { "toWallet.userId": userId },
      ],
    };

    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const transactions = await Transaction.find(query)
      .populate("fromWallet", "userId")
      .populate("toWallet", "userId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    return sendResponse(res, 200, true, "Transaction history retrieved successfully", {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return sendError(res, 500, "Failed to get transaction history", error.message);
  }
};


export const getCommissionHistory = async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user!.id; // authenticated agent
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Only fetch transactions where the agent initiated the transaction AND has commission
    const query = {
      initiatedBy: agentId,
      type: { $in: ["cash_in", "cash_out"] },
      commission: { $gt: 0 },
    };

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("fromWallet toWallet", "userId balance"); // optional: populate wallets

    const total = await Transaction.countDocuments(query);

    const totalCommissionAgg = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, totalCommission: { $sum: "$commission" } } },
    ]);

    const totalCommission = totalCommissionAgg[0]?.totalCommission || 0;

    return sendResponse(res, 200, true, "Commission history retrieved successfully", {
      transactions,
      totalCommission,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return sendError(res, 500, "Failed to get commission history", error.message);
  }
};