import e from "express";
import refreshToken from "../controllers/refreshToken.js";
import userRoutes from "./userRoutes.js"
import projectRoutes from "./projectRoutes.js"
import messageRoutes from "./messageRoutes.js"
import { authMiddleware } from "../utils/auth.js";
import "../models/index.js"

const router = e.Router();

//api...
router.use("/users", userRoutes);
router.get("/refreshToken", refreshToken);

router.use("/projects", projectRoutes);

router.use(authMiddleware);
router.use("/message", messageRoutes)

export default router;