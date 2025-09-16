import Message from "../models/Message.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

export const getPublicProjects = async (req, res) => {
  const sortBy = req.query.sortBy || "name";
  const sortOrder = req.query.sortOrder || 1;
  const title = req.query.title || "";
  const owner = req.query.owner || "";
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;

  try {
    //this was a pain to figure out.  hoping it works 👀
    //update, it worked!
    const projects = await Project.aggregate()
      .match({
        private: false,
        title: {
          $regex: title,
          $options: "i",
        },
      })
      .lookup({
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      })
      .unwind("owner")
      .match({
        "owner.username": {
          $regex: owner,
          $options: "i",
        },
      })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    //count documents in the array that matches this search
    const count = await Project.aggregate()
      .match({
        private: false,
        title: {
          $regex: title,
          $options: "i",
        },
      })
      .lookup({
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      })
      .unwind("owner")
      .match({
        "owner.username": {
          $regex: owner,
          $options: "i",
        },
      })
      .count("count");

    res.json({ projects, total: count });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPrivateProjects = async (req, res) => {
  const sortBy = req.query.sortBy || "name";
  const sortOrder = req.query.sortOrder || 1;
  const title = req.query.title || "";
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;
  const userId = req.user._id;

  try {
    //grabs a list based on user search query for title, and a list of
    //projects user is involved in
    const projects = await Project.find({
      title: {
        $regex: title,
        $options: "i",
      },
      "user.user": {
        $in: [userId],
      },
    })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const count = await Project.countDocuments({
      title: {
        $regex: title,
        $options: "i",
      },
      "user.user": {
        $in: [userId],
      },
    });

    res.json({ projects, total: count });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProject = async (req, res) => {
  if (!req.project) return res.status(403).json({ message: "Unauthorized" });

  try {
    await req.project.populate([
      { path: "user.user" },
      { path: "tasks", populate: { path: "user", path: "completedBy" } },
      { path: "joinRequests" },
    ]);

    res.send(req.project);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createProject = async (req, res) => {
  if (!req.body)
    return res.status(400).json({ message: "Body cannot be empty" });

  try {
    const userSetup = {
      owner: req.user._id,
      user: [
        {
          user: req.user._id,
          role: "owner",
          permissions: [
            "getProject",
            "editProject",
            "deleteProject",
            "addTask",
            "editTask",
            "deleteTask",
            "archiveTask",
          ],
        },
      ],
    };

    const newProject = Object.assign(req.body, userSetup);

    const project = await Project.create(newProject);

    res.status(201).json(project);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const editCollaborator = async (req, res) => {
  try {
    if (!req.body)
      return res.status(400).json({ message: "Body cannot be empty" });

    if (!req.project) return res.status(403).json({ message: "unauthorized" });

    const user = req.project.user.find((editor) =>
      editor.user.equals(req.user._id)
    );

    if (user.role !== "owner")
      return res.status(403).json({ message: "unauthorized" });

    const project = Object.assign(req.project, req.body);

    await project.save();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

export const editProject = async (req, res) => {
  try {
    if (!req.body)
      return res.status(400).json({ message: "Body cannot be empty" });

    if (!req.project) return res.status(403).json({ message: "unauthorized" });

    const { user, ...safeUpdate } = req.body;
    const project = Object.assign(req.project, safeUpdate);

    await project.save();

    res.json(project);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    if (!req.project) return res.status(403).json({ message: "unauthorized" });

    //deletes associated tasks and project
    await Task.deleteMany({ _id: { $in: req.project.tasks } });
    await req.project.deleteOne();

    res.json({ message: "Project successfully deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

export const leaveProject = async (req, res) => {
  try {
    if (!req.project) return res.status(403).json({ message: "unauthorized" });

    const user = req.project.user.find((currentUser) =>
      currentUser.user.equals(req.user.id)
    );
    if (!user) {
      return res.status(400).json({ message: "user not in project" });
    }
    if (user.role === "owner") {
      return res
        .status(403)
        .json({ message: "project owner cannot leave project" });
    }

    req.project.user = req.project.user.filter(
      (currentUser) => !currentUser.user.equals(req.user.id)
    );

    await req.project.save();

    return res.json({ message: "left project successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const sendInvite = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.project) {
      return res.status(403).json({ message: "unauthorized" });
    }

    const invitedUser = await User.findById(userId);
    if (!invitedUser) {
      return res.status(404).json({ message: "user not found" });
    }

    if (req.project.invited.includes(userId)) {
      return res.status(400).json({ message: "user already invited" });
    }

    const message = await Message.create({
      user: userId,
      project: req.project._id,
      message: `${req.user.username} invited you to join the project: ${req.project.title}`,
    });

    req.project.invited.push(userId);
    req.project.joinRequests.push(message._id);
    await req.project.save();

    invitedUser.message.push(message._id);
    await invitedUser.save();

    return res.status(201).json({ message: "invite sent successfully", invite: message });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal server error" });
  }
};
