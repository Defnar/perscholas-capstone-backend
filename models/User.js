import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      minLength: 6,
      required: [true, "username required"],
    },
    password: {
      type: String,
      minLength: 8,
      required: function () {
        return !this.gitHubId;
      },
    },
    githubId: {
      type: String,
      required: function () {
        return !this.password;
      },
    },
    projectList: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "Project",
    },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.githubId;
        delete ret.projectList;

        return ret;
      },
    },
  }
);

UserSchema.pre("save", async function (next) {
  if (this.password && (this.isNew || this.isModified("password"))) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
});

UserSchema.methods.isCorrectPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

export const User = model("User", UserSchema);
