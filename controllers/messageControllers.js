import Project from "../models/Project.js";

export const acceptJoin = async (req, res) => {
  try {
    if (!req.user || !req.message)
      return res.status(403).json({ message: "unauthorized" });

    const project = await Project.findById(req.message.project);

    if (!project) return res.status(400).json({ message: "no project found" });

    if (!project.invited.includes(req.user._id))
      return res.status(403).json({ message: "unauthorized" });

    if (!project.user.some((user) => user.user.equals(req.user._id))) {
      project.user.push({
        user: req.user._id,
        role: "collaborator",
        permissions: ["getProject"],
      });

      project.invited = project.invited.filter(
        (id) => !id.equals(req.user._id)
      );

      await project.save();
      return res.json({ message: "user successfully added" });
    } else {
      return res.json({ message: "user already in project" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
};
