import Task from "../models/Task";

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
