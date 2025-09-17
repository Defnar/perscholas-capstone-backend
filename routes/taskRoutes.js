import e from "express";
import { contentMiddleware } from "../middleware/middleware.js";
import {
  addTask,
  deleteTask,
  editTask,
  getTask,
  updateTaskStatus,
} from "../controllers/taskControllers.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
const router = e.Router({ mergeParams: true });

//api/projects/:projectId/tasks/

router.post("/", contentMiddleware(Project, "user", "addTask"), addTask);

router.use(contentMiddleware(Project, "user", "getProject"));
router.get(
  "/:taskId",
  contentMiddleware(Task, "project", "getProject"),
  getTask
);
router.put(
  "/:taskId",
  contentMiddleware(Task, "project", "editTask"),
  editTask
);
router.put(
  "/:taskId/status",
  contentMiddleware(Task, "project", "updateTaskStatus"),
  updateTaskStatus
);
router.delete(
  "/:taskId",
  contentMiddleware(Task, "project", "deleteTask"),
  deleteTask
);

export default router;
