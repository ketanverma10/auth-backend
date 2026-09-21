import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token.js";
import { createSession } from "../service/session.service.js";
import { AppError } from "../utils/AppError.js";
import { generateAccessToken } from "../utils/token.js";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/refreshToken.js";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        message: "AccessToken is missing in cookies",
      });
    }

    const token = accessToken.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "Access token is missing",
      });
    }

    const decoded = verifyAccessToken(token);

    if (typeof decoded === "string" || !decoded.sub) {
      return res.status(401).json({
        message: "Invalid access token",
      });
    }

    req.user = decoded.sub;

    next();
  } catch (error) {
    next(error);
  }
};

export const googleCallbackController = async (req: Request, res: Response) => {
  const userId = req.user as unknown as string;

  if (!userId) {
    throw new AppError("Google authentication failed", 401);
  }
  const accessToken = generateAccessToken(userId);

  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await createSession(userId, refreshTokenHash, expiresAt);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/auth",
  });

  return res.status(200).json({
    message: "Google login successful",
  });
};
