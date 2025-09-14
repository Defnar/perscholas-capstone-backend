import e from "express";
import { contentMiddleware } from "../middleware/middleware";
import { getTask } from "../controllers/taskControllers";
const router = e.Router();

//api/projects/:projectId/tasks/:taskId
router.get(":taskId", getTask);

router.put(":taskId", contentMiddleware())

export default router;