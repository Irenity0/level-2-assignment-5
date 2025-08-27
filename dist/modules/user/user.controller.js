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
exports.searchUserByName = exports.updateUserProfile = void 0;
const user_model_1 = require("./user.model");
const wallet_model_1 = require("../wallet/wallet.model");
const response_1 = require("../../utils/response");
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id; // authenticated user's ID
        const { name, email, avatar } = req.body; // fields to update
        // Build update object dynamically
        const updateData = {};
        if (name && name.trim() !== "")
            updateData.name = name.trim();
        if (email && email.trim() !== "")
            updateData.email = email.trim();
        if (avatar)
            updateData.avatar = avatar;
        if (Object.keys(updateData).length === 0) {
            return (0, response_1.sendError)(res, 400, "No valid fields provided to update");
        }
        const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true } // return updated doc & validate
        ).select("-password"); // remove sensitive info
        if (!updatedUser) {
            return (0, response_1.sendError)(res, 404, "User not found");
        }
        return (0, response_1.sendResponse)(res, 200, true, "Profile updated successfully", {
            user: updatedUser,
        });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to update profile", error.message);
    }
});
exports.updateUserProfile = updateUserProfile;
const searchUserByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.query;
        if (!name || name.trim() === "") {
            return (0, response_1.sendError)(res, 400, "Name query is required");
        }
        // Find users whose name contains the query (case-insensitive)
        const users = yield user_model_1.User.find({
            name: { $regex: name.trim(), $options: "i" },
        }).limit(10);
        if (!users || users.length === 0) {
            return (0, response_1.sendResponse)(res, 200, true, "No users found", { users: [] });
        }
        // Map users to include wallet ID and filter out users without a wallet
        const result = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            const wallet = yield wallet_model_1.Wallet.findOne({ userId: user._id });
            if (!wallet)
                return null; // skip users without a wallet
            return {
                id: user._id,
                name: user.name,
                walletId: wallet._id,
            };
        })));
        const filteredResult = result.filter(Boolean); // remove nulls
        if (filteredResult.length === 0) {
            return (0, response_1.sendResponse)(res, 200, true, "No users found with wallet", { users: [] });
        }
        console.log(filteredResult);
        return (0, response_1.sendResponse)(res, 200, true, "Users found", { users: filteredResult });
    }
    catch (error) {
        return (0, response_1.sendError)(res, 500, "Failed to search users", error.message);
    }
});
exports.searchUserByName = searchUserByName;
