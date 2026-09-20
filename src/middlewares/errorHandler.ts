import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  
  if(error instanceof AppError){
      return res.status(error.statusCode).json({
    message: error.message,
  });
  }

  return res.status(500).json({
    message: "Internal Server Error",
  });
};
