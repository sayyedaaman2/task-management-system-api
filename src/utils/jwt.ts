import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";

import serverConfig from "@/config/env.js";
import { AppError } from "@/utils/error.js";

// Define the shape of your specific payload
export interface ITokenPayload extends JwtPayload {
  userId: string;
  email: string;
  userType: string;
}

/**
 * Generate a token (Access or Refresh)
 */

export const generateToken = (payload: Partial<ITokenPayload>, isRefreshToken = false) => {
  const secret = isRefreshToken ? serverConfig.jwtRefreshSecret : serverConfig.jwtSecret;
  const expiresIn = (
    isRefreshToken ? serverConfig.jwtRefreshExpiresIn : serverConfig.jwtExpiresIn
  ) as SignOptions["expiresIn"];

  const cleanPayload = { ...payload };
  delete cleanPayload.iat;
  delete cleanPayload.exp;
  delete cleanPayload.nbf;
  const options: SignOptions = {
    expiresIn,
    algorithm: "HS256",
  };
  return jwt.sign(cleanPayload, secret, options);
};

/**
 * Verify token (Defaults to Access Token secret)
 */
export const verifyToken = (token: string, isRefreshToken = false): ITokenPayload => {
  // Use the correct secret based on what type of token we are verifying
  const secret = isRefreshToken ? serverConfig.jwtRefreshSecret : serverConfig.jwtSecret;
  try {
    return jwt.verify(token, secret) as ITokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Token has expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid token");
    }
    throw new AppError("Token verification failed");
  }
};

/**
 * Decode without verification (Use sparingly)
 */
export const decodeToken = (token: string): ITokenPayload | null => {
  return jwt.decode(token) as ITokenPayload | null;
};

/**
 * Refresh Token Logic
 * Uses Refresh Secret to verify, then returns a NEW Access Token
 */
export const refreshToken = (token: string): string => {
  try {
    // 1. Verify using the REFRESH secret
    const decoded = jwt.verify(token, serverConfig.jwtRefreshSecret, {
      ignoreExpiration: true,
    }) as ITokenPayload;
    if (!decoded) {
      throw new AppError("Invalid token payload");
    }

    // 2. Return a NEW Access Token (isRefreshToken = false)
    return generateToken(decoded, false);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid refresh token signature");
    }
    throw new AppError("Token refresh failed");
  }
};

/**
 * Boolean check for validity (Access Tokens)
 */
export const isTokenValid = (token: string): boolean => {
  try {
    verifyToken(token, false);
    return true;
  } catch {
    return false;
  }
};
