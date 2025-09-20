import "dotenv/config";
import e from "express";
import db from "./config/connection.js";
import indexRoutes from "./routes/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = e();
const port = process.env.PORT || 8000;

app.use(e.json());
app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true
    }
));
app.use(cookieParser());

app.use("/", (req, res, next) => {
    console.log(req.path);
    console.log(req.params.url);
    next();
})
app.use("/api", indexRoutes);

db.once("open", () => {
  app.listen(port, () => console.log(`server up at http://localhost:${port}`));
});
