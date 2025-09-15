import e from "express";
import { deleteUser, login, logout, register, updateUser } from "../controllers/userControllers.js";
import authRoutes from "./authRoutes.js";
const router = e.Router();

//api/users...
router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.post("/auth", authRoutes);
router.put("/", updateUser);
router.delete("/", deleteUser);

export default router;
