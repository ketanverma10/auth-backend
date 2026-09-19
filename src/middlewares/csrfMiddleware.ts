import { Request, Response, NextFunction } from "express";

export const csrfChecker =  (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const csrfCookie = req.cookies.csrfToken;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie) {
    return res.status(403).json({
      message: "Csrf token is missing in cookies",
    });
  }

  if (!csrfHeader) {
    return res.status(403).json({
      message: "Csrf token is missing in Headers",
    });
  }

  if (csrfCookie !== csrfHeader) {
    return res.status(403).json({
      message: "CSRF token does not match",
    });
  }

  next();
};
