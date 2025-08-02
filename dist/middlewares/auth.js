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
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../modules/user/user.model");
const response_1 = require("../utils/response");
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const token = ((_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "")) || ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.token);
        if (!token) {
            return (0, response_1.sendError)(res, 401, "Access denied. No token provided.");
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield user_model_1.User.findById(decoded.id);
        if (!user || !user.isActive) {
            return (0, response_1.sendError)(res, 401, "Invalid token or user not active.");
        }
        req.user = {
            id: user._id.toString(),
            role: user.role,
            email: user.email,
        };
        next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, 401, "Invalid token.");
    }
});
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return (0, response_1.sendError)(res, 401, "Authentication required.");
        }
        if (!roles.includes(req.user.role)) {
            return (0, response_1.sendError)(res, 403, "Access denied. Insufficient permissions.");
        }
        next();
    };
};
exports.authorize = authorize;
