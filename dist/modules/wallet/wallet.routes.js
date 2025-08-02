"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet_controller_1 = require("./wallet.controller");
const auth_1 = require("../../middlewares/auth");
const validation_1 = require("../../middlewares/validation");
const validation_2 = require("../../utils/validation");
const router = (0, express_1.Router)();
// User routes
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("user", "agent"), wallet_controller_1.getWallet);
router.post("/add-money", auth_1.authenticate, (0, auth_1.authorize)("user"), (0, validation_1.validate)(validation_2.transactionSchema), wallet_controller_1.addMoney);
router.post("/withdraw", auth_1.authenticate, (0, auth_1.authorize)("user"), (0, validation_1.validate)(validation_2.transactionSchema), wallet_controller_1.withdraw);
router.post("/send-money", auth_1.authenticate, (0, auth_1.authorize)("user"), (0, validation_1.validate)(validation_2.transactionSchema), wallet_controller_1.sendMoney);
// Agent routes
router.post("/cash-in", auth_1.authenticate, (0, auth_1.authorize)("agent"), (0, validation_1.validate)(validation_2.walletActionSchema), wallet_controller_1.cashIn);
router.post("/cash-out", auth_1.authenticate, (0, auth_1.authorize)("agent"), (0, validation_1.validate)(validation_2.walletActionSchema), wallet_controller_1.cashOut);
exports.default = router;
