import Project from "../models/Project";

export const getPublicProjects = async (req, res) => {
  const sortBy = req.query.sortBy || "name";
  const sortOrder = req.query.sortOrder || 1;
  const title = req.query.sortAuthor || "";
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
        from: "User",
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

    res.json(projects);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPrivateProjects = async (req, res) => {
  const sortBy = req.query.sortBy || "name";
  const sortOrder = req.query.sortOrder || 1;
  const title = req.query.sortAuthor || "";
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;
  const userId = req.user._id;

  try {
    const projects = await Project.find({
      title: {
        $regex: title,
        $options: "i",
      },
      users: {
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
  if (!res.project) return res.status(403).json({ message: "Unauthorized" });

  try {
    await req.project.populate({ path: "users", path: "tasks" });

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
    await Project.create(req.body);

    res.status(201).json({ message: "project created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};
