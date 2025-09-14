import e from "express";
import { createProject, deleteProject, editProject, getPrivateProjects, getProject, getPublicProjects } from "../controllers/projectControllers";
import { contentMiddleware } from "../middleware/middleware";
import taskRoutes from "./taskRoutes"
import Project from "../models/Project";
const router = e.Router();


//api/projects

router.get("/", getPublicProjects);
router.get("/private", getPrivateProjects);
router.post("/", createProject);

router.get("/:id", contentMiddleware(Project, "users", "getProject"), getProject)
router.put("/:id", contentMiddleware(Project, "users", "editProject"), editProject)
router.delete("/:id", contentMiddleware(Project, "users", "deleteProject"), deleteProject)

router.use("/:id/tasks", contentMiddleware(Project, "users", "getProject"), taskRoutes)

export default router;