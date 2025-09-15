import { Schema, model } from "mongoose";
import Message from "./Message.js";

const ProjectSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    users: {
      type: [Schema.Types.ObjectId],
      ref: "Collaborator",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    tasks: {
      type: [Schema.Types.ObjectId],
      ref: "Task",
      default: [],
    },
    deadline: {
      type: Date,
    },
    private: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done", "Overdue", "Archived"],
      required: true,
      default: "To Do",
    },
    joinRequests: {
      type: [Schema.Types.ObjectId],
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

const Project = model("Project", ProjectSchema);

export default Project;
