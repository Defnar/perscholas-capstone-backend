import Project from "../models/Project.js";
import Task from "../models/Task.js";

export const getTask = async (req, res) => {
  if (!req.task) return res.status(403).json({ message: "unauthorized" });

  const task = await req.task.populate("user").populate("completedBy");

  res.json(task);
};

export const addTask = async (req, res) => {
  if (!req.project) return res.status(403).json({ message: "unauthorized" });
  if (!req.body) return res.status(400).json({ message: "body missing" });

  try {
    const taskOwners = {
      user: req.user._id,
      project: req.project._id,
    };
    const task = await Task.create({ ...req.body, ...taskOwners });

    await Project.findByIdAndUpdate(req.project._id, {
      $push: {
        tasks: task._id
      }
    });

    res.status(201).json(task);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const editTask = async (req, res) => {
  if (!req.task) return res.status(403).json({ message: "unauthorized" });
  if (!req.body) return res.status(400).json({ message: "body missing" });

  if (
    //ensures user can make edits to archive if they are attempting it
    req.body.status &&
    ((req.body.status === "archive" && req.task.status !== "archive") ||
      (req.body.status !== "archive" && req.task.status === "archive"))
  ) {
    const user = req.project.users.find((collab) =>
      collab.user.equals(req.user._id)
    );
    if (!user.permissions.includes("archiveTask"))
      return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const task = Object.assign(req.task, req.body);

    await task.save();

    res.json(task);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  if (!req.task) return res.status(403).json({ message: "unauthorized" });
  if (!req.body) return res.status(400).json({ message: "body missing" });

  try {
    await req.task.deleteOne();

    await Project.findByIdAndUpdate(req.project._id, {
      $pull: {
        tasks: req.task._id
      }
    })

    res.json({ message: "Task successfully deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};
