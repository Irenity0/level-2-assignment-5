"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("./transaction.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get("/history", auth_1.authenticate, (0, auth_1.authorize)("user", "agent"), transaction_controller_1.getTransactionHistory);
router.get("/commission", auth_1.authenticate, (0, auth_1.authorize)("agent"), transaction_controller_1.getCommissionHistory);
exports.default = router;
