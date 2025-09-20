import Message from "../models/Message.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

export const acceptJoin = async (req, res) => {
  try {
    if (!req.user || !req.message)
      return res.status(403).json({ error: "unauthorized to access this" });

    const project = await Project.findById(req.message.project);
    const user = await User.findById(req.user._id);

    if (!project) return res.status(400).json({ error: "no project found" });

    if (!project.invited.includes(req.user._id))
      return res.status(403).json({ error: "unauthorized to access this" });

    if (!project.user.some((user) => user.user.equals(req.user._id))) {
      project.user.push({
        user: req.user._id,
        role: "collaborator",
        permissions: ["getProject"],
      });

      project.invited = project.invited.filter(
        (id) => !id.equals(req.user._id)
      );

      user.message = user.message.filter((m) => !m._id.equals(req.message._id));

      await user.save();

      await project.save();
      return res.json({ message: "user successfully added" });
    } else {
      return res.json({ error: "user already in project" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const requestJoin = async (req, res) => {
  try {
    if (!req.user)
      return res.status(403).json({ error: "unauthorized to access this" });

    const { message } = req.body;
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) return res.status(404).json({ error: "project not found" });

    const messageExists = await Message.findOne({
      user: req.user._id,
      project: project._id,
    });

    if (messageExists)
      return res.status(400).json({ error: "join request already sent" });

    const newMessage = new Message({
      user: req.user._id,
      project: project._id,
      message: `${req.user.username} has requested to join this project${
        message ? ", with the following message: " + message : ""
      }`,
    });

    await newMessage.save();
    project.joinRequests.push(newMessage._id);
    await project.save();

    return res.status(200).json({ message: "request successfully sent" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const rejectJoin = async (req, res) => {
  try {
    if (!req.user || !req.message)
      return res.status(403).json({ error: "unauthorized to access this" });

    const message = await Message.findById(req.message._id);
    if (!message) return res.status(404).json({ error: "request not found" });

    if (message.type && message.type !== "joinRequest") {
      return res.status(400).json({ error: "not a join request" });
    }

    const project = await Project.findById(message.project);
    if (!project) return res.status(404).json({ error: "project not found" });
    const user = await User.findById(user._id);

    project.joinRequests = project.joinRequests.filter(
      (reqId) => !reqId.equals(message._id)
    );

    user.message = user.message.filter((m) => !m._id.equals(req.message._id));

    await user.save();
    await project.save();

    await message.deleteOne();

    return res.json({ message: "rejected join request" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};
