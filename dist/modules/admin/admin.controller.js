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
exports.suspendAgent = exports.approveAgent = exports.unblockWallet = exports.blockWallet = exports.getAllTransactions = exports.getAllWallets = exports.getAllUsers = void 0;
const user_model_1 = require("../user/user.model");
const wallet_model_1 = require("../wallet/wallet.model");
const transaction_model_1 = require("../transaction/transaction.model");
const response_1 = require("../../utils/response");
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const users = yield user_model_1.User.find({ role: { $ne: "admin" } })
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = yield user_model_1.User.countDocuments({ role: { $ne: "admin" } });
        return (0, response_1.sendResponse)(res, 200, true, "Users retrieved successfully", {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to get users", error.message);
    }
});
exports.getAllUsers = getAllUsers;
const getAllWallets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const wallets = yield wallet_model_1.Wallet.find()
            .populate("userId", "name email phone role")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = yield wallet_model_1.Wallet.countDocuments();
        return (0, response_1.sendResponse)(res, 200, true, "Wallets retrieved successfully", {
            wallets,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to get wallets", error.message);
    }
});
exports.getAllWallets = getAllWallets;
const getAllTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const transactions = yield transaction_model_1.Transaction.find()
            .populate("initiatedBy", "name email role")
            .populate("fromWallet", "userId")
            .populate("toWallet", "userId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = yield transaction_model_1.Transaction.countDocuments();
        return (0, response_1.sendResponse)(res, 200, true, "Transactions retrieved successfully", {
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
        return (0, response_1.sendError)(res, 500, "Failed to get transactions", error.message);
    }
});
exports.getAllTransactions = getAllTransactions;
const blockWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletId } = req.params;
        const wallet = yield wallet_model_1.Wallet.findById(walletId);
        if (!wallet) {
            return (0, response_1.sendError)(res, 404, "Wallet not found");
        }
        wallet.isBlocked = true;
        yield wallet.save();
        return (0, response_1.sendResponse)(res, 200, true, "Wallet blocked successfully", {
            wallet: {
                id: wallet._id,
                isBlocked: wallet.isBlocked,
            },
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to block wallet", error.message);
    }
});
exports.blockWallet = blockWallet;
const unblockWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletId } = req.params;
        const wallet = yield wallet_model_1.Wallet.findById(walletId);
        if (!wallet) {
            return (0, response_1.sendError)(res, 404, "Wallet not found");
        }
        wallet.isBlocked = false;
        yield wallet.save();
        return (0, response_1.sendResponse)(res, 200, true, "Wallet unblocked successfully", {
            wallet: {
                id: wallet._id,
                isBlocked: wallet.isBlocked,
            },
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to unblock wallet", error.message);
    }
});
exports.unblockWallet = unblockWallet;
const approveAgent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield user_model_1.User.findById(userId);
        if (!user) {
            return (0, response_1.sendError)(res, 404, "User not found");
        }
        if (user.role !== "agent") {
            return (0, response_1.sendError)(res, 400, "User is not an agent");
        }
        user.isApproved = true;
        yield user.save();
        return (0, response_1.sendResponse)(res, 200, true, "Agent approved successfully", {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
            },
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to approve agent", error.message);
    }
});
exports.approveAgent = approveAgent;
const suspendAgent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield user_model_1.User.findById(userId);
        if (!user) {
            return (0, response_1.sendError)(res, 404, "User not found");
        }
        if (user.role !== "agent") {
            return (0, response_1.sendError)(res, 400, "User is not an agent");
        }
        user.isApproved = false;
        yield user.save();
        return (0, response_1.sendResponse)(res, 200, true, "Agent suspended successfully", {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
            },
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to suspend agent", error.message);
    }
});
exports.suspendAgent = suspendAgent;
