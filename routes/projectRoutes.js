import e from "express";
import {
  createProject,
  deleteProject,
  editCollaborator,
  editProject,
  getPrivateProjects,
  getProject,
  getPublicProjects,
} from "../controllers/projectControllers.js";
import { contentMiddleware } from "../middleware/middleware.js";
import taskRoutes from "./taskRoutes.js";
import Project from "../models/Project.js";
const router = e.Router();

//api/projects

router.get("/", getPublicProjects);
router.get("/private", getPrivateProjects);
router.post("/", createProject);

router.put(
  "/:projectId/contributors",
  contentMiddleware(Project, "user", "getProject"),
  editCollaborator
);
router.get(
  "/:projectId",
  contentMiddleware(Project, "user", "getProject"),
  getProject
);
router.put(
  "/:projectId",
  contentMiddleware(Project, "user", "editProject"),
  editProject
);
router.delete(
  "/:projectId",
  contentMiddleware(Project, "user", "deleteProject"),
  deleteProject
);

router.use("/:projectId/tasks", taskRoutes);

export default router;
