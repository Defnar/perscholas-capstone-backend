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
  "/:id/contributors",
  contentMiddleware(Project, "user", "getProject"),
  editCollaborator
);
router.get(
  "/:id",
  contentMiddleware(Project, "user", "getProject"),
  getProject
);
router.put(
  "/:id",
  contentMiddleware(Project, "user", "editProject"),
  editProject
);
router.delete(
  "/:id",
  contentMiddleware(Project, "user", "deleteProject"),
  deleteProject
);

router.use("/:id/tasks", taskRoutes);

export default router;
