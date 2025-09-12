import { Schema, model } from "mongoose";

const CollaboratorSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    role: {
        type: String,
        enum: ["owner", "collaborator"]
    },
    permissions: [{
        type: String,
        enum: ["get", "edit", "delete", "addTask", "editTasks", "deleteTask, archiveTasks"]
    }]
})

const Collaborator = model("Collaborator", CollaboratorSchema);

export default Collaborator;