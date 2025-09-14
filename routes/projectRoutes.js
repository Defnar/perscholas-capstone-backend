import e from "express";
import { createProject, getPrivateProjects, getProject, getPublicProjects } from "../controllers/projectControllers";
import { contentMiddleware } from "../middleware/middleware";
import Project from "../models/Project";
const router = e.Router();


//api/projects

router.get("/", getPublicProjects);
router.get("/private", getPrivateProjects);
router.post("/", createProject);

router.get("/:id", contentMiddleware(Project, "users", "getProject"), getProject)
