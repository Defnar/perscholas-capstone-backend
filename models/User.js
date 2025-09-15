import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      minLength: 6,
      required: [true, "username required"],
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "email required"],
      unique: true,
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
      unique: true,
      required: function () {
        return !this.password;
      },
    },
    projectList: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "Project",
    },
    message: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: "Message",
    },
  },
  {
    timestamps: true,
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

UserSchema.pre("save", async function () {
  if (this.password && (this.isNew || this.isModified("password"))) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
});

UserSchema.methods.isCorrectPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = model("User", UserSchema);

export default User;
