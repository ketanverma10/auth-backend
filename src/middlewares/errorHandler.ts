import { Request, Response, NextFunction, response } from "express";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error.message === "User already exists") {
    return res.status(409).json({
      message: error.message,
    });
  }
  if (error.message === "Invalid email/password or password") {
    return res.status(401).json({
      message: error.message,
    });
  }
  if (error.message === "Either email or phone number is required") {
    return res.status(400).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: "Internal Server error",
  });
};
