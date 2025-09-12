import Project from "../models/Project";
import Collaborator from "../models/Collaborator";

export const contentMiddleware =
  (Model, parentKey, permKey) => async (req, res, next) => {
    try {
      const id = Object.keys(req.params).pop();

      const model = await Model.findById(req.params[id]);

      //checks if the parent key returns an array to act accordingly.  array checks array for id
      if (model && Array.isArray(model[parentKey])) {
        if (model[parentKey].some(collab => collab.user.equals(req.user._id))) {
          const collaborator = await Collaborator.findById(model[parentKey]);

          if (permKey && collaborator.permissions.includes(permKey) || collaborator.role==="owner")
            req[Model.modelName.toLowerCase()] = model;
        }
      } else if (model && model[parentKey].equals(req[parentKey]._id))
        //not an array, checking for id without array
        req[Model.modelName.toLowerCase()] = model;

      next();
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "internal server error" });
    }
  };
