import e from "express";
import refreshToken from "../controllers/refreshToken";
import userRoutes from "./userRoutes"
import projectRoutes from "./projectRoutes"
import { authMiddleware } from "../utils/auth";

const router = e.Router();

//api...
router.use("/users", userRoutes);
router.use("/refreshToken", refreshToken);

router.use(authMiddleware);

router.use("/projects", projectRoutes);

export default router;