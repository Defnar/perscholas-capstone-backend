import Project from "../models/Project.js";
import Task from "../models/Task.js";
import mongoose from "mongoose";

export const getPublicProjects = async (req, res) => {
  const sortBy = req.query.sortBy || "name";
  const sortOrder = req.query.sortOrder || 1;
  const title = req.query.title || "";
  const author = req.query.author || "";
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;

  try {
    //this was a pain to figure out.  hoping it works 👀
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
          $regex: author,
          $options: "i",
        },
      })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    console.log(projects);

    res.json(projects);
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

    res.json(projects);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProject = async (req, res) => {
  if (!req.project) return res.status(403).json({ message: "Unauthorized" });

  try {
    await req.project.populate({
      path: "users",
      path: "tasks",
      path: "joinRequests",
    });

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

    const project = await Project.create({ ...req.body, ...userSetup });

    res.status(201).json(project);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const editProject = async (req, res) => {
  try {
    if (!req.body)
      return res.status(400).json({ message: "Body cannot be empty" });

    if (!req.project) return res.status(403).json({ message: "unauthorized" });

    const project = Object.assign(req.project, req.body);

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
