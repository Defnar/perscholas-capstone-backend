import { Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  {
    timestamps: true,
  }
);

const Message = model("Message", MessageSchema);

export default Message;