import e from "express";
import { getPrivateProjects, getPublicProjects } from "../controllers/projectControllers";
const router = e.Router();


//api/projects

router.get("/", getPublicProjects);
router.get("/private", getPrivateProjects);


