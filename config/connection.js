import mongoose from "mongoose";

const db = mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("database connected"))
  .catch((err) => console.log(err));

export default db;
