import e from "express";
import { contentMiddleware } from "../middleware/middleware.js";
import { acceptJoin, requestJoin } from "../controllers/messageControllers.js";
import Message from "../models/Message.js";
const router = e.Router();

//api/message/
router.post("/:messageId", contentMiddleware(Message, "user"), acceptJoin);
router.post("/projects/:projectId", requestJoin)

export default router;