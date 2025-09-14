import e from "express";
import { getPublicProjects } from "../controllers/projectControllers";
const router = e.Router();


//api/projects

router.get("/", getPublicProjects);
