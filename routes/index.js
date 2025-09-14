import e from "express";
import refreshToken from "../controllers/refreshToken";
import userRoutes from "./userRoutes"

const router = e.Router();

//api...
router.use("/users", userRoutes);
router.use("/refreshToken", refreshToken);
router.use("/projects", );

export default router;