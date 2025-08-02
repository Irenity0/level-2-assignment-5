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
exports.getProfile = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../user/user.model");
const response_1 = require("../../utils/response");
const wallet_model_1 = require("../wallet/wallet.model");
const generateToken = (payload) => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
    const signOptions = {
        expiresIn: jwtExpiresIn,
    };
    return jsonwebtoken_1.default.sign(payload, jwtSecret, signOptions);
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, password, role } = req.body;
        // Check if user already exists
        const existingUser = yield user_model_1.User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return (0, response_1.sendError)(res, 400, "User with this email or phone already exists");
        }
        // Create user
        const user = new user_model_1.User({ name, email, phone, password, role });
        yield user.save();
        // Create wallet for user/agent
        if (role === "user" || role === "agent") {
            const wallet = new wallet_model_1.Wallet({ userId: user._id });
            yield wallet.save();
        }
        // Generate JWT token
        const token = generateToken({ id: user._id, role: user.role });
        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return (0, response_1.sendResponse)(res, 201, true, "User registered successfully", {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isApproved: user.isApproved,
            },
            token,
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Registration failed", error.message);
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user and include password
        const user = yield user_model_1.User.findOne({ email }).select("+password");
        if (!user) {
            return (0, response_1.sendError)(res, 401, "Invalid email or password");
        }
        // Check password
        const isPasswordValid = yield user.comparePassword(password);
        if (!isPasswordValid) {
            return (0, response_1.sendError)(res, 401, "Invalid email or password");
        }
        // Check if user is active
        if (!user.isActive) {
            return (0, response_1.sendError)(res, 401, "Account is deactivated");
        }
        // Check if agent is approved
        if (user.role === "agent" && !user.isApproved) {
            return (0, response_1.sendError)(res, 401, "Agent account is not approved yet");
        }
        // Generate JWT token
        const token = generateToken({ id: user._id, role: user.role });
        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return (0, response_1.sendResponse)(res, 200, true, "Login successful", {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isApproved: user.isApproved,
            },
            token,
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Login failed", error.message);
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("token");
        return (0, response_1.sendResponse)(res, 200, true, "Logout successful");
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Logout failed", error.message);
    }
});
exports.logout = logout;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(req.user.id);
        if (!user) {
            return (0, response_1.sendError)(res, 404, "User not found");
        }
        let wallet = null;
        if (user.role !== "admin") {
            wallet = yield wallet_model_1.Wallet.findOne({ userId: user._id });
        }
        return (0, response_1.sendResponse)(res, 200, true, "Profile retrieved successfully", {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                isApproved: user.isApproved,
            },
            wallet: wallet
                ? {
                    id: wallet._id,
                    balance: wallet.balance,
                    isBlocked: wallet.isBlocked,
                }
                : null,
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to get profile", error.message);
    }
});
exports.getProfile = getProfile;
