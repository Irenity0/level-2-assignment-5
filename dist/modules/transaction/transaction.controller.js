"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommissionHistory = exports.getTransactionHistory = void 0;
const response_1 = require("../../utils/response");
const transaction_model_1 = require("./transaction.model");
const getTransactionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Get filters from query
        const { type, startDate, endDate } = req.query;
        // Build the query
        const query = {
            $or: [
                { initiatedBy: userId },
                { "fromWallet.userId": userId },
                { "toWallet.userId": userId },
            ],
        };
        if (type)
            query.type = type;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        const transactions = yield transaction_model_1.Transaction.find(query)
            .populate("fromWallet", "userId")
            .populate("toWallet", "userId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = yield transaction_model_1.Transaction.countDocuments(query);
        return (0, response_1.sendResponse)(res, 200, true, "Transaction history retrieved successfully", {
            transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to get transaction history", error.message);
    }
});
exports.getTransactionHistory = getTransactionHistory;
const getCommissionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const agentId = req.user.id; // authenticated agent
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Only fetch transactions where the agent initiated the transaction AND has commission
        const query = {
            initiatedBy: agentId,
            type: { $in: ["cash_in", "cash_out"] },
            commission: { $gt: 0 },
        };
        const transactions = yield transaction_model_1.Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("fromWallet toWallet", "userId balance"); // optional: populate wallets
        const total = yield transaction_model_1.Transaction.countDocuments(query);
        const totalCommissionAgg = yield transaction_model_1.Transaction.aggregate([
            { $match: query },
            { $group: { _id: null, totalCommission: { $sum: "$commission" } } },
        ]);
        const totalCommission = ((_a = totalCommissionAgg[0]) === null || _a === void 0 ? void 0 : _a.totalCommission) || 0;
        return (0, response_1.sendResponse)(res, 200, true, "Commission history retrieved successfully", {
            transactions,
            totalCommission,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to get commission history", error.message);
    }
});
exports.getCommissionHistory = getCommissionHistory;
