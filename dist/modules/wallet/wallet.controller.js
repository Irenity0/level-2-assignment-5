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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashOut = exports.cashIn = exports.sendMoney = exports.withdraw = exports.addMoney = exports.getWallet = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const wallet_model_1 = require("./wallet.model");
const transaction_model_1 = require("../transaction/transaction.model");
const user_model_1 = require("../user/user.model");
const response_1 = require("../../utils/response");
const getWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wallet = yield wallet_model_1.Wallet.findOne({ userId: req.user.id });
        if (!wallet) {
            return (0, response_1.sendError)(res, 404, "Wallet not found");
        }
        return (0, response_1.sendResponse)(res, 200, true, "Wallet retrieved successfully", {
            wallet: {
                id: wallet._id,
                balance: wallet.balance,
                isBlocked: wallet.isBlocked,
            },
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to get wallet", error.message);
    }
});
exports.getWallet = getWallet;
const addMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { amount, description = "Add money to wallet" } = req.body;
        const userId = req.user.id;
        // Find wallet
        const wallet = yield wallet_model_1.Wallet.findOne({ userId }).session(session);
        if (!wallet) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 404, "Wallet not found");
        }
        if (wallet.isBlocked) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 403, "Wallet is blocked");
        }
        // Update wallet balance
        wallet.balance += amount;
        yield wallet.save({ session });
        // Create transaction record
        const transaction = new transaction_model_1.Transaction({
            type: "add_money",
            amount,
            toWallet: wallet._id,
            initiatedBy: userId,
            status: "completed",
            description,
        });
        yield transaction.save({ session });
        yield session.commitTransaction();
        return (0, response_1.sendResponse)(res, 200, true, "Money added successfully", {
            wallet: {
                id: wallet._id,
                balance: wallet.balance,
            },
            transaction: {
                id: transaction._id,
                type: transaction.type,
                amount: transaction.amount,
                status: transaction.status,
            },
        });
    }
    catch (error) {
        yield session.abortTransaction();
        return (0, response_1.sendError)(res, 500, "Failed to add money", error.message);
    }
    finally {
        session.endSession();
    }
});
exports.addMoney = addMoney;
const withdraw = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { amount, description = "Withdraw from wallet" } = req.body;
        const userId = req.user.id;
        // Find wallet
        const wallet = yield wallet_model_1.Wallet.findOne({ userId }).session(session);
        if (!wallet) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 404, "Wallet not found");
        }
        if (wallet.isBlocked) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 403, "Wallet is blocked");
        }
        if (wallet.balance < amount) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 400, "Insufficient balance");
        }
        // Update wallet balance
        wallet.balance -= amount;
        yield wallet.save({ session });
        // Create transaction record
        const transaction = new transaction_model_1.Transaction({
            type: "withdraw",
            amount,
            fromWallet: wallet._id,
            initiatedBy: userId,
            status: "completed",
            description,
        });
        yield transaction.save({ session });
        yield session.commitTransaction();
        return (0, response_1.sendResponse)(res, 200, true, "Money withdrawn successfully", {
            wallet: {
                id: wallet._id,
                balance: wallet.balance,
            },
            transaction: {
                id: transaction._id,
                type: transaction.type,
                amount: transaction.amount,
                status: transaction.status,
            },
        });
    }
    catch (error) {
        yield session.abortTransaction();
        return (0, response_1.sendError)(res, 500, "Failed to withdraw money", error.message);
    }
    finally {
        session.endSession();
    }
});
exports.withdraw = withdraw;
const sendMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { amount, toWallet: toWalletId, description = "Send money" } = req.body;
        const userId = req.user.id;
        // Find sender wallet
        const fromWallet = yield wallet_model_1.Wallet.findOne({ userId }).session(session);
        if (!fromWallet) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 404, "Sender wallet not found");
        }
        if (fromWallet.isBlocked) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 403, "Sender wallet is blocked");
        }
        // Find receiver wallet
        const toWallet = yield wallet_model_1.Wallet.findById(toWalletId).session(session);
        if (!toWallet) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 404, "Receiver wallet not found");
        }
        if (toWallet.isBlocked) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 403, "Receiver wallet is blocked");
        }
        if (fromWallet._id.toString() === toWallet._id.toString()) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 400, "Cannot send money to yourself");
        }
        if (fromWallet.balance < amount) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 400, "Insufficient balance");
        }
        // Update balances
        fromWallet.balance -= amount;
        toWallet.balance += amount;
        yield fromWallet.save({ session });
        yield toWallet.save({ session });
        // Create transaction record
        const transaction = new transaction_model_1.Transaction({
            type: "send_money",
            amount,
            fromWallet: fromWallet._id,
            toWallet: toWallet._id,
            initiatedBy: userId,
            status: "completed",
            description,
        });
        yield transaction.save({ session });
        yield session.commitTransaction();
        return (0, response_1.sendResponse)(res, 200, true, "Money sent successfully", {
            transaction: {
                id: transaction._id,
                type: transaction.type,
                amount: transaction.amount,
                status: transaction.status,
            },
            fromWallet: {
                id: fromWallet._id,
                balance: fromWallet.balance,
            },
        });
    }
    catch (error) {
        yield session.abortTransaction();
        return (0, response_1.sendError)(res, 500, "Failed to send money", error.message);
    }
    finally {
        session.endSession();
    }
});
exports.sendMoney = sendMoney;
// Agent functions
const cashIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { userId, amount, description = "Cash in by agent" } = req.body;
        const agentId = req.user.id;
        // Verify agent
        const agent = yield user_model_1.User.findById(agentId);
        if (!agent || agent.role !== "agent" || !agent.isApproved) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 403, "Unauthorized agent");
        }
        // Find user wallet
        const userWallet = yield wallet_model_1.Wallet.findOne({ userId }).session(session);
        if (!userWallet) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 404, "User wallet not found");
        }
        if (userWallet.isBlocked) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 403, "User wallet is blocked");
        }
        // Calculate commission (1% for agents)
        const commission = amount * 0.01;
        // Update user wallet
        userWallet.balance += amount;
        yield userWallet.save({ session });
        // Update agent wallet with commission
        const agentWallet = yield wallet_model_1.Wallet.findOne({ userId: agentId }).session(session);
        if (agentWallet) {
            agentWallet.balance += commission;
            yield agentWallet.save({ session });
        }
        // Create transaction record
        const transaction = new transaction_model_1.Transaction({
            type: "cash_in",
            amount,
            commission,
            toWallet: userWallet._id,
            initiatedBy: agentId,
            status: "completed",
            description,
        });
        yield transaction.save({ session });
        yield session.commitTransaction();
        return (0, response_1.sendResponse)(res, 200, true, "Cash in successful", {
            transaction: {
                id: transaction._id,
                type: transaction.type,
                amount: transaction.amount,
                commission: transaction.commission,
                status: transaction.status,
            },
        });
    }
    catch (error) {
        yield session.abortTransaction();
        return (0, response_1.sendError)(res, 500, "Cash in failed", error.message);
    }
    finally {
        session.endSession();
    }
});
exports.cashIn = cashIn;
const cashOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { userId, amount, description = "Cash out by agent" } = req.body;
        const agentId = req.user.id;
        // Verify agent
        const agent = yield user_model_1.User.findById(agentId);
        if (!agent || agent.role !== "agent" || !agent.isApproved) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 403, "Unauthorized agent");
        }
        // Find user wallet
        const userWallet = yield wallet_model_1.Wallet.findOne({ userId }).session(session);
        if (!userWallet) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 404, "User wallet not found");
        }
        if (userWallet.isBlocked) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 403, "User wallet is blocked");
        }
        if (userWallet.balance < amount) {
            yield session.abortTransaction();
            return (0, response_1.sendError)(res, 400, "Insufficient balance in user wallet");
        }
        // Calculate commission (1% for agents)
        const commission = amount * 0.01;
        // Update user wallet
        userWallet.balance -= amount;
        yield userWallet.save({ session });
        // Update agent wallet with commission
        const agentWallet = yield wallet_model_1.Wallet.findOne({ userId: agentId }).session(session);
        if (agentWallet) {
            agentWallet.balance += commission;
            yield agentWallet.save({ session });
        }
        // Create transaction record
        const transaction = new transaction_model_1.Transaction({
            type: "cash_out",
            amount,
            commission,
            fromWallet: userWallet._id,
            initiatedBy: agentId,
            status: "completed",
            description,
        });
        yield transaction.save({ session });
        yield session.commitTransaction();
        return (0, response_1.sendResponse)(res, 200, true, "Cash out successful", {
            transaction: {
                id: transaction._id,
                type: transaction.type,
                amount: transaction.amount,
                commission: transaction.commission,
                status: transaction.status,
            },
        });
    }
    catch (error) {
        yield session.abortTransaction();
        return (0, response_1.sendError)(res, 500, "Cash out failed", error.message);
    }
    finally {
        session.endSession();
    }
});
exports.cashOut = cashOut;
