import e from "express";
import {
  deleteUser,
  findUserById,
  findUsers,
  login,
  logout,
  register,
  updateUser,
} from "../controllers/userControllers.js";
import authRoutes from "./authRoutes.js";
import { authMiddleware } from "../utils/auth.js";
const router = e.Router();

//api/users...
router.post("/login", login);
router.post("/register", register);
router.use("/auth", authRoutes);
router.get("/find/:userId", findUserById);

router.use(authMiddleware);
router.post("/logout", logout);
router.put("/", updateUser);
router.delete("/", deleteUser);
router.get("/", findUsers);

export default router;
