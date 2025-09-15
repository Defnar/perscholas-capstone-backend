import e from "express";
import { contentMiddleware } from "../middleware/middleware.js";
import { addTask, deleteTask, editTask, getTask } from "../controllers/taskControllers.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js"
const router = e.Router();

//api/projects/:projectId/tasks/:taskId
router.post("/:taskId", contentMiddleware(Project, "users", "addTask"), addTask)

router.use(contentMiddleware(Project, "users", "getProject"))
router.get("/:taskId", getTask);
router.put("/:taskId", contentMiddleware(Task, "project", "editTask"), editTask)
router.delete("/:taskId", contentMiddleware(Task, "project", "deleteTask"), deleteTask)

export default router;