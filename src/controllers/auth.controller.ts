import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../service/auth.service.js";
import { generateAccessToken } from "../utils/token.js";

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
    const user = await loginUser(data);

    const accessToken = generateAccessToken(user.id);
    return res.status(200).json({
      message: "Login successfully",
      accessToken,
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


