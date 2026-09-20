import { Request, Response, NextFunction } from "express";
import { getUserById } from "../service/user.service.js";
import { AppError } from "../utils/AppError.js";
export const profileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user;

    if (!userId) {
     throw new AppError("Unauthorized", 401);
    }

    const user = await getUserById(userId);
    return res
      .status(200)
      .json({ message: "Authenticated successfully", user: user });
  } catch (error) {
    next(error);
  }
};
