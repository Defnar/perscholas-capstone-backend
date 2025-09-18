import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { updateTaskHistory } from "../utils/updateTaskHistory.js";

export const getTask = async (req, res) => {
  if (!req.task)
    return res.status(403).json({ error: "unauthorized to access this" });

  const task = await req.task.populate("user").populate("completedBy");

  res.json(task);
};

export const addTask = async (req, res) => {
  if (!req.project)
    return res.status(403).json({ error: "unauthorized to access this" });
  if (!req.body) return res.status(400).json({ error: "body missing" });

  try {
    const taskOwners = {
      user: req.user._id,
      project: req.project._id,
    };
    const task = await Task.create({ ...req.body, ...taskOwners, updatedHistory: {user: req.user._id, action: "created", time: Date.now()} });

    await Project.findByIdAndUpdate(req.project._id, {
      $push: {
        tasks: task._id,
      },
    });

    res.status(201).json(task);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const editTask = async (req, res) => {
  if (!req.task)
    return res.status(403).json({ error: "unauthorized to access this" });
  if (!req.body) return res.status(400).json({ error: "body missing" });

  if (
    //ensures user can make edits to archive if they are attempting it
    req.body.status &&
    ((req.body.status === "Archive" && req.task.status !== "Archive") ||
      (req.body.status !== "Archive" && req.task.status === "Archive"))
  ) {
    const user = req.project.user.find((collab) =>
      collab.user.equals(req.user._id)
    );
    if (!user.permissions.includes("archiveTask"))
      return res.status(403).json({ error: "Unauthorized to make this edit" });
  }

  try {
    const task = Object.assign(req.task, req.body);

    if (req.task.deadline) 
      req.task.deadline = new Date(req.task.deadline);

    await task.save();

    await updateTaskHistory(
      task._id,
      req.user._id,
      `Made the following changes: ${req.body}`
    );

    res.json(task);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  if (!req.task)
    return res.status(403).json({ error: "unauthorized to access this" });

  try {
    await req.task.deleteOne();

    await Project.findByIdAndUpdate(req.project._id, {
      $pull: {
        tasks: req.task._id,
      },
    });

    res.json({ message: "Task successfully deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

export const updateTaskStatus = async (req, res) => {
  if (!req.task)
    return res.status(403).json({ error: "unauthorized to access this" });
  if (!req.body) return res.status(400).json({ error: "body missing" });

  const { status } = req.body;
  if (!status)
    return res.status(403).json({ error: "Unauthorized to make edits" });

  if (
    //ensures user can make edits to archive if they are attempting it
    (status === "Archive" && req.task.status !== "Archive") ||
    (status !== "Archive" && req.task.status === "Archive")
  ) {
    const user = req.project.user.find((collab) =>
      collab.user.equals(req.user._id)
    );
    if (!user.permissions.includes("archiveTask"))
      return res.status(403).json({ error: "Unauthorized to make this edit" });
  }

  try {
    req.task.status = status;
    await req.task.save();

    await updateTaskHistory(
      req.task._id,
      req.user._id,
      `Changed status to ${status}`
    );

    res.json({ message: "task updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "internal server error" });
  }
};
