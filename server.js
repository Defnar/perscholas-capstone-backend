import "dotenv/config";
import e from "express";
import db from "./config/connection.js";
import indexRoutes from "./routes/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = e();
const port = process.env.PORT || 8000;

app.use(e.json());
app.use(cors());
app.use(cookieParser());

app.use("/", (req, res, next) => {
    console.log(req.path);
    next();
})
app.use("/api", indexRoutes);

db.once("open", () => {
  app.listen(port, () => console.log(`server up at http://localhost:${port}`));
});
