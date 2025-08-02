"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
(0, database_1.default)();
app_1.default.listen(PORT, () => {
    console.log(`Kitler wallet ready on port http://localhost:${PORT} uwu`);
});
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Promise Rejection:", err);
    process.exit(1);
});
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});
