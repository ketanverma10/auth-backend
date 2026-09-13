import { Router } from "express";
import { validateYupSchema } from "../middlewares/validateYupSchema.js";
import { registerSchema,loginSchema } from "../schemas/auth.schema.js";
import { registerController,loginController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { profileController } from "../controllers/user.controller.js";

const router = Router();

router.post("/register", validateYupSchema(registerSchema), registerController);
router.post("/login",validateYupSchema(loginSchema), loginController)
router.get("/profile",authMiddleware,profileController)
export default router;
