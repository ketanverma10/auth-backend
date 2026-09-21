import { Router } from "express";
import { validateYupSchema } from "../middlewares/validateYupSchema.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import {
  registerController,
  loginController,
  logoutController,
  csrfController,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { profileController } from "../controllers/user.controller.js";
import { refreshController } from "../controllers/auth.controller.js";
import { csrfChecker } from "../middlewares/csrfMiddleware.js";
import { authRateLimiter } from "../middlewares/rateLimiter.js";
import passport from "../config/passport.js";
const router = Router();

router.post("/register", validateYupSchema(registerSchema), registerController);
router.post("/login",authRateLimiter, validateYupSchema(loginSchema), loginController);
router.get("/profile", authMiddleware, profileController);
router.post("/refresh",authRateLimiter,csrfChecker, refreshController);
router.post("/logout",csrfChecker, logoutController);
router.get("/csrf", csrfController);
router.get("/google",  passport.authenticate("google", {
    scope: ["profile", "email"],
  }))
router.get('/google/callback',  passport.authenticate("google", {
    session: false,
  }))

export default router;
