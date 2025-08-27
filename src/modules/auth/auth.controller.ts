import type { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../user/user.model";
import { sendResponse, sendError } from "../../utils/response";
import type { AuthRequest } from "../../types";
import { Wallet } from "../wallet/wallet.model";

const generateToken = (payload: object): string => {
  const jwtSecret = process.env.JWT_SECRET!;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

  const signOptions: SignOptions = {
    expiresIn: jwtExpiresIn as any,
  };

  return jwt.sign(payload, jwtSecret, signOptions);
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return sendError(
        res,
        400,
        "User with this email or phone already exists"
      );
    }

    // Create user
    const user = new User({ name, email, phone, password, role });
    await user.save();

    // Create wallet for user/agent
    if (role === "user" || role === "agent") {
      const wallet = new Wallet({ userId: user._id });
      await wallet.save();
    }

    // Generate JWT token
    const token = generateToken({ id: user._id, role: user.role });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return sendResponse(res, 201, true, "User registered successfully", {
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
  } catch (error: any) {
    return sendError(res, 500, "Registration failed", error.message);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 401, "Account is deactivated");
    }

    // Check if agent is approved
    if (user.role === "agent" && !user.isApproved) {
      return sendError(res, 401, "Agent account is not approved yet");
    }

    // Generate JWT token
    const token = generateToken({ id: user._id, role: user.role });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return sendResponse(res, 200, true, "Login successful", {
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
  } catch (error: any) {
    return sendError(res, 500, "Login failed", error.message);
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    res.clearCookie("token");
    return sendResponse(res, 200, true, "Logout successful");
  } catch (error: any) {
    return sendError(res, 500, "Logout failed", error.message);
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    let wallet = null;
    if (user.role !== "admin") {
      wallet = await Wallet.findOne({ userId: user._id });
    }

    return sendResponse(res, 200, true, "Profile retrieved successfully", {
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
  } catch (error: any) {
    return sendError(res, 500, "Failed to get profile", error.message);
  }
};
