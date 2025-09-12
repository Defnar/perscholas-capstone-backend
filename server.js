import "dotenv/config";
import e from "express";
import db from "./config/connection";

const app = e();
const port = process.env.PORT || 8000;

app.use(e.json());

app.use("/api", /*routes go here*/);

db.once("connect", () => {
    app.listen(port, () => console.log(`server up at http://localhost:${port}`))
})