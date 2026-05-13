import type { Request, Response, NextFunction } from "express";

import authService from "@/service/auth.service.js";
import { generateToken, verifyToken } from "@/utils/jwt.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const user = await authService.register(name, email, password);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await authService.login(email, password);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate Access Token
    const accessToken = generateToken(
      {
        userId: user._id.toString(),
        email: user.email,
        userType: user.userType,
      },
      false // isRefreshToken = false
    );

    // Generate Refresh Token
    const refreshToken = generateToken(
      {
        userId: user._id.toString(),
        email: user.email,
        userType: user.userType,
      },
      true
    );
    // set refresh token cookie

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const safeUser = { ...user.toObject() };
    delete safeUser.password;

    res.status(200).json({
      message: "Login successful",
      data: {
        user: safeUser,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // get refresh token
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    // verify refresh token
    const decoded = verifyToken(refreshToken, true); // isRefreshToken = true

    // generate new access token
    const accessToken = generateToken(
      {
        userId: decoded.userId,
        email: decoded.email,
        userType: decoded.userType,
      },
      false // isRefreshToken = false
    );

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};


export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(400).json({ message: "User ID not found in token" });
        }
        const profile = await authService.getProfile(userId);
        if (!profile) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
}