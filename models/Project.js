import { Schema, model } from "mongoose";
const ProjectSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["owner", "collaborator"],
          required: true,
        },
        permissions: [
          {
            type: String,
            enum: [
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
      },
    ],
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
      enum: ["To Do", "In Progress", "Done", "Overdue", "Archive"],
      required: true,
      default: "To Do",
    },
    joinRequests: {
      type: [Schema.Types.ObjectId],
      ref: "Message",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Project = model("Project", ProjectSchema);

export default Project;
