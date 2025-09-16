import e from "express";
import { contentMiddleware } from "../middleware/middleware.js";
import { acceptJoin, rejectJoin, requestJoin } from "../controllers/messageControllers.js";
import Message from "../models/Message.js";
const router = e.Router();

//api/message/
router.post("/:messageId", contentMiddleware(Message, "user"), acceptJoin);
router.post("/projects/:projectId", requestJoin)
router.post("/:messageId/reject", contentMiddleware(Message, "user"), rejectJoin)

export default router;