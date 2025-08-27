import { Response } from "express";
import { User } from "./user.model";
import { Wallet } from "../wallet/wallet.model";
import { sendResponse, sendError } from "../../utils/response";
import { AuthRequest } from "../../types";

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id; // authenticated user's ID
    const { name, email, avatar } = req.body; // fields to update

    // Build update object dynamically
    const updateData: any = {};
    if (name && name.trim() !== "") updateData.name = name.trim();
    if (email && email.trim() !== "") updateData.email = email.trim();
    if (avatar) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 400, "No valid fields provided to update");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true } // return updated doc & validate
    ).select("-password"); // remove sensitive info

    if (!updatedUser) {
      return sendError(res, 404, "User not found");
    }

    return sendResponse(res, 200, true, "Profile updated successfully", {
      user: updatedUser,
    });
  } catch (error: any) {
    return sendError(res, 500, "Failed to update profile", error.message);
  }
};

export const searchUserByName = async (req: any, res: Response) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === "") {
      return sendError(res, 400, "Name query is required");
    }

    // Find users whose name contains the query (case-insensitive)
    const users = await User.find({
      name: { $regex: name.trim(), $options: "i" },
    }).limit(10);

    if (!users || users.length === 0) {
      return sendResponse(res, 200, true, "No users found", { users: [] });
    }

    // Map users to include wallet ID and filter out users without a wallet
    const result = await Promise.all(
      users.map(async (user) => {
        const wallet = await Wallet.findOne({ userId: user._id });
        if (!wallet) return null; // skip users without a wallet
        return {
          id: user._id,
          name: user.name,
          walletId: wallet._id,
        };
      })
    );

    const filteredResult = result.filter(Boolean); // remove nulls

    if (filteredResult.length === 0) {
      return sendResponse(res, 200, true, "No users found with wallet", { users: [] });
    }
    console.log(filteredResult)

    return sendResponse(res, 200, true, "Users found", { users: filteredResult });
  } catch (error: any) {
    return sendError(res, 500, "Failed to search users", error.message);
  }
};