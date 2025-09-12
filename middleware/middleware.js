const contentMiddleware = (Model, parentKey) => async (req, res, next) => {
  try {
    const id = Object.keys(req.params).pop();

    const model = await Model.findById(req.params[id]);

    if (model && model[parentKey].equals(req[parentKey]._id))
      req[Model.modelName.toLowerCase()] = model;

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "internal server error" });
  }
};


