import "dotenv/config";
import e from "express";
import db from "./config/connection.js";
import indexRoutes from "./routes/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = e();
const port = process.env.PORT || 8000;

app.use(e.json());
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api", indexRoutes);

db.once("open", () => {
  app.listen(port, () => console.log(`server up now`));
});
