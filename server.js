import "dotenv/config";
import e from "express";
import db from "./config/connection";
import indexRoutes from "./routes/index"
import cors from "cors";

const app = e();
const port = process.env.PORT || 8000;

app.use(e.json());

app.use(cors());

app.use("/api", indexRoutes);

db.once("connect", () => {
    app.listen(port, () => console.log(`server up at http://localhost:${port}`))
})