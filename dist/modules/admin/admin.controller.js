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
exports.suspendAgent = exports.approveAgent = exports.unblockWallet = exports.blockWallet = exports.getAllTransactions = exports.getAllWallets = exports.unblockUser = exports.blockUser = exports.getAllUsers = exports.getOverview = void 0;
const user_model_1 = require("../user/user.model");
const wallet_model_1 = require("../wallet/wallet.model");
const transaction_model_1 = require("../transaction/transaction.model");
const response_1 = require("../../utils/response");
// 📊 Overview
const getOverview = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const totalUsers = yield user_model_1.User.countDocuments({ role: { $ne: "admin" } });
        const totalAgents = yield user_model_1.User.countDocuments({ role: "agent" });
        const totalTransactions = yield transaction_model_1.Transaction.countDocuments();
        const totalVolumeAgg = yield transaction_model_1.Transaction.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const totalVolume = ((_a = totalVolumeAgg[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        return (0, response_1.sendResponse)(res, 200, true, "Overview retrieved successfully", {
            totalUsers,
            totalAgents,
            totalTransactions,
            totalVolume,
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to get overview", error.message);
    }
});
exports.getOverview = getOverview;
// 👤 Manage Users (with search, filter, pagination)
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";
        const status = req.query.status; // "blocked" | "active"
        const filter = { role: { $ne: "admin" } };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }
        if (status) {
            const wallets = yield wallet_model_1.Wallet.find({ isBlocked: status === "blocked" });
            filter._id = { $in: wallets.map((w) => w.userId) };
        }
        const users = yield user_model_1.User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = yield user_model_1.User.countDocuments(filter);
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
// 🚫 Block User
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield user_model_1.User.findById(userId);
        if (!user) {
            return (0, response_1.sendError)(res, 404, "User not found");
        }
        // Deactivate user
        user.isActive = false;
        yield user.save();
        // Block all wallets for this user
        yield wallet_model_1.Wallet.updateMany({ userId }, { isBlocked: true });
        return (0, response_1.sendResponse)(res, 200, true, "User blocked successfully", {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isActive: user.isActive,
            },
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to block user", error.message);
    }
});
exports.blockUser = blockUser;
// ✅ Unblock User
const unblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield user_model_1.User.findById(userId);
        if (!user) {
            return (0, response_1.sendError)(res, 404, "User not found");
        }
        // Reactivate user
        user.isActive = true;
        yield user.save();
        // Unblock all wallets for this user
        yield wallet_model_1.Wallet.updateMany({ userId }, { isBlocked: false });
        return (0, response_1.sendResponse)(res, 200, true, "User unblocked successfully", {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isActive: user.isActive,
            },
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to unblock user", error.message);
    }
});
exports.unblockUser = unblockUser;
// 👛 Manage Wallets (with search + filter)
const getAllWallets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";
        const isBlocked = req.query.isBlocked; // "true" | "false"
        const filter = {};
        if (isBlocked)
            filter.isBlocked = isBlocked === "true";
        const wallets = yield wallet_model_1.Wallet.find(filter)
            .populate("userId", "name email phone role")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        if (search) {
            // Apply search on populated fields
            wallets.filter((w) => {
                var _a, _b, _c;
                return [(_a = w.userId) === null || _a === void 0 ? void 0 : _a.name, (_b = w.userId) === null || _b === void 0 ? void 0 : _b.email, (_c = w.userId) === null || _c === void 0 ? void 0 : _c.phone]
                    .join(" ")
                    .toLowerCase()
                    .includes(search.toLowerCase());
            });
        }
        const total = yield wallet_model_1.Wallet.countDocuments(filter);
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
// 💸 Transactions with advanced filters
const getAllTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { type, status, minAmount, maxAmount, startDate, endDate, search } = req.query;
        const filter = {};
        if (type)
            filter.type = type;
        if (status)
            filter.status = status;
        if (minAmount || maxAmount) {
            filter.amount = {};
            if (minAmount)
                filter.amount.$gte = Number(minAmount);
            if (maxAmount)
                filter.amount.$lte = Number(maxAmount);
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        if (search) {
            // fuzzy search in user names/emails through population
            const users = yield user_model_1.User.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            });
            filter.$or = [
                { initiatedBy: { $in: users.map((u) => u._id) } },
                { "fromWallet.userId": { $in: users.map((u) => u._id) } },
                { "toWallet.userId": { $in: users.map((u) => u._id) } },
            ];
        }
        const transactions = yield transaction_model_1.Transaction.find(filter)
            .populate("initiatedBy", "name email role")
            .populate({ path: "fromWallet", populate: { path: "userId", select: "name email" } })
            .populate({ path: "toWallet", populate: { path: "userId", select: "name email" } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = yield transaction_model_1.Transaction.countDocuments(filter);
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
