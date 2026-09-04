import { Request,Response,NextFunction } from "express";
import { registerUser } from "../service/auth.service.js";
import { email } from "zod";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
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