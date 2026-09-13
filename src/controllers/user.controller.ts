import { Request, Response, NextFunction } from "express";
import { getUserById } from "../service/user.service.js";
export const profileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const userId = req.user

    if (!userId) { return res.status(401).json({ message: "Unauthorized", }); }

    const user = await getUserById(userId);
    return res
      .status(200)
      .json({ message: "Authenticated successfully", user: user });
  } catch (error) {
    next(error);
  }
};
