"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/api/user/user.routes.ts
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get("/search", auth_1.authenticate, user_controller_1.searchUserByName);
router.put("/update", auth_1.authenticate, (0, auth_1.authorize)("user", "agent", "admin"), user_controller_1.updateUserProfile);
exports.default = router;
