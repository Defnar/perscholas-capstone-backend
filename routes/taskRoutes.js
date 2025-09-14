import e from "express";
import { contentMiddleware } from "../middleware/middleware";
import { addTask, getTask } from "../controllers/taskControllers";
import Project from "../models/Project";
const router = e.Router();

//api/projects/:projectId/tasks/:taskId
router.post("/:taskId", contentMiddleware(Project, "users", "addTask"), addTask)

router.use(contentMiddleware(Project, "users", "getProject"))
router.get("/:taskId", getTask);

export default router;