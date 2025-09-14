export const getTask = (req, res) => {
  if (!req.task) return res.status(403).json({ message: "unauthorized" });

  res.json(req.task);
};
