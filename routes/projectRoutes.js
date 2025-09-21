import e from "express";
import {
  acceptJoinRequest,
  createProject,
  deleteProject,
  editCollaborator,
  editProject,
  getPrivateProjects,
  getProject,
  getPublicProjects,
  leaveProject,
  rejectJoinRequest,
  sendInvite,
} from "../controllers/projectControllers.js";
import { authMiddleware } from "../utils/auth.js";
import { contentMiddleware } from "../middleware/middleware.js";
import taskRoutes from "./taskRoutes.js";
import Project from "../models/Project.js";
import { requestJoin } from "../controllers/messageControllers.js";
const router = e.Router();

//api/projects

router.get("/", getPublicProjects);

router.use(authMiddleware);
router.get("/private", getPrivateProjects);

router.post("/", createProject);
router.post("/:projectId/request", requestJoin);

router.put(
  "/:projectId/collaborators",
  contentMiddleware(Project, "user", "inviteUsers"),
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

router.post(
  "/:projectId/invite",
  contentMiddleware(Project, "user", "inviteUsers"),
  sendInvite
);

router.put(
  "/:projectId/accept",
  contentMiddleware(Project, "user", "inviteUsers"),
  acceptJoinRequest
);

router.put(
  "/:projectId/reject",
  contentMiddleware(Project, "user", "inviteUsers"),
  rejectJoinRequest
);
router.post(
  "/:projectId/leave",
  contentMiddleware(Project, "user", "getProject"),
  leaveProject
);

router.use("/:projectId/tasks", taskRoutes);

export default router;
