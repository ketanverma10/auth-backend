import { Router } from "express";
import { validateYupSchema } from "../middlewares/validateYupSchema.js";
import { registerSchema } from "../schemas/auth.schema.js";
import { registerController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", validateYupSchema(registerSchema), registerController);

export default router;
