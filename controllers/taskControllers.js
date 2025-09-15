import Task from "../models/Task.js";

export const getTask = (req, res) => {
  if (!req.task) return res.status(403).json({ message: "unauthorized" });

  res.json(req.task);
};

export const addTask = async (req, res) => {
  if (!req.project) return res.status(403).json({ message: "unauthorized" });
  if (!req.body) return res.status(400).json({ message: "body missing" });

  try {
    const task = await Task.create(req.body);

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

    res.json({ message: "Task successfully deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};
