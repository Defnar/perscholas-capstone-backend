import { Schema, model } from "mongoose";

const TaskSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done", "Overdue", "Archive"],
      required: true,
      default: "To Do",
    },
    deadline: {
      type: Date,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    updatedHistory: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
      action: {
        type: String
      },
      time: {
        type: Date
      }
    }],
    default: []
  },
  {
    timestamps: true,
  }
);

const Task = model("Task", TaskSchema);
export default Task;
