import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token.js";

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
