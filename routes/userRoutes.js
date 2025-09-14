import e from "express";
import { login, logout, register } from "../controllers/userControllers";
const router = e.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

export default router;