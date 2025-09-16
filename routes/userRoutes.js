import e from "express";
import {
  deleteUser,
  findUsers,
  login,
  logout,
  register,
  updateUser,
} from "../controllers/userControllers.js";
import authRoutes from "./authRoutes.js";
import { authMiddleware } from "../utils/auth.js";
import { acceptJoin } from "../controllers/messageControllers.js";
const router = e.Router();

//api/users...
router.post("/login", login);
router.post("/register", register);
router.use("/auth", authRoutes);

router.use(authMiddleware);
router.post("/logout", logout);
router.put("/", updateUser);
router.delete("/", deleteUser);
router.get("/", findUsers);

router.post("/message", acceptJoin)

export default router;
