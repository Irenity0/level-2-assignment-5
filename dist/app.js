"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const wallet_routes_1 = __importDefault(require("./modules/wallet/wallet.routes"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const transaction_routes_1 = __importDefault(require("./modules/transaction/transaction.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:5173" || "http://localhost:3000",
    credentials: true,
}));
// Catch invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON payload. Please fix your request body.",
        });
    }
    next(err);
});
// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Kitler wallet is running uwu!",
        timestamp: new Date().toISOString(),
    });
});
// Simple root API endpoint
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Kitler wallet uwu",
    });
});
// routees
app.use("/api/auth", auth_routes_1.default);
app.use("/api/wallet", wallet_routes_1.default);
app.use("/api/transactions", transaction_routes_1.default);
app.use("/api/user", user_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
// Global error handler
app.use((error, req, res, next) => {
    console.error("Global Error:", error);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
});
exports.default = app;
