import e from "express";
import refreshToken from "../controllers/refreshToken.js";
import userRoutes from "./userRoutes.js"
import projectRoutes from "./projectRoutes.js"
import { authMiddleware } from "../utils/auth.js";

const router = e.Router();

//api...
router.use("/users", userRoutes);
router.get("/refreshToken", refreshToken);

router.use(authMiddleware);

router.use("/projects", projectRoutes);

export default router;