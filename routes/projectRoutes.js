import e from "express";
import { createProject, deleteProject, editProject, getPrivateProjects, getProject, getPublicProjects } from "../controllers/projectControllers.js";
import { contentMiddleware } from "../middleware/middleware.js";
import taskRoutes from "./taskRoutes.js"
import Project from "../models/Project.js";
const router = e.Router();


//api/projects

router.get("/", getPublicProjects);
router.get("/private", getPrivateProjects);
router.post("/", createProject);

router.get("/:id", contentMiddleware(Project, "users", "getProject"), getProject)
router.put("/:id", contentMiddleware(Project, "users", "editProject"), editProject)
router.delete("/:id", contentMiddleware(Project, "users", "deleteProject"), deleteProject)

router.use("/:id/tasks", taskRoutes)

export default router;