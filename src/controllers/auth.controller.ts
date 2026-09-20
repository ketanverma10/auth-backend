import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../service/auth.service.js";
import {
  findSessionByRefreshToken,
  rotateSession,
} from "../service/session.service.js";
import { generateAccessToken } from "../utils/token.js";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/refreshToken.js";

import { revokeSession } from "../service/session.service.js";
import { generateCsrfToken } from "../utils/csrfToken.js";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;

    const response = await registerUser(data);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        phoneNumber: response.phoneNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;
    const { user, refreshToken } = await loginUser(data);

    const accessToken = generateAccessToken(user.id);

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
      message: "Login successfully",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new Error("Refresh Token is required");
    }

    const session = await findSessionByRefreshToken(refreshToken);

    const newRefreshToken = generateRefreshToken();

    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // await revokeSession(session.id);

    // await createSession(session.userId, newRefreshTokenHash, expiresAt);

    await rotateSession(
      session.id,
      session.userId,
      newRefreshTokenHash,
      expiresAt,
    );

    const newAccessToken = generateAccessToken(session.userId);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/auth",
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(200).json({
        message: "Logged out successfully",
      });
    }

    const session = await findSessionByRefreshToken(refreshToken);

    await revokeSession(session.id);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/auth",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const csrfController = (
  req: Request,
  res: Response
) => {
  const csrfToken = generateCsrfToken();

  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  return res.status(200).json({
    message: "CSRF token generated successfully",
  });
};
