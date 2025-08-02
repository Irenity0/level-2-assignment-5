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
        const transactions = yield transaction_model_1.Transaction.find({
            $or: [{ initiatedBy: userId }, { fromWallet: { $exists: true } }, { toWallet: { $exists: true } }],
        })
            .populate("fromWallet", "userId")
            .populate("toWallet", "userId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = yield transaction_model_1.Transaction.countDocuments({
            $or: [{ initiatedBy: userId }, { fromWallet: { $exists: true } }, { toWallet: { $exists: true } }],
        });
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
        const agentId = req.user.id;
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const transactions = yield transaction_model_1.Transaction.find({
            initiatedBy: agentId,
            type: { $in: ["cash_in", "cash_out"] },
            commission: { $gt: 0 },
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = yield transaction_model_1.Transaction.countDocuments({
            initiatedBy: agentId,
            type: { $in: ["cash_in", "cash_out"] },
            commission: { $gt: 0 },
        });
        const totalCommission = yield transaction_model_1.Transaction.aggregate([
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
        ]);
        return (0, response_1.sendResponse)(res, 200, true, "Commission history retrieved successfully", {
            transactions,
            totalCommission: ((_a = totalCommission[0]) === null || _a === void 0 ? void 0 : _a.totalCommission) || 0,
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
