import e from "express";
import { login, logout, register } from "../controllers/userControllers";
import authRoutes from "./authRoutes";
const router = e.Router();

//api/users...
router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

router.post("/auth", authRoutes);

export default router;
