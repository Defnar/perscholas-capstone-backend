import {Schema, model} from "mongoose";
import Message from "./Message";

const ProjectSchema = new Schema({
    timestamps: true,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    collaborators: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        default: []
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    tasks: {
        type: [Schema.Types.ObjectId],
        ref: "Task",
        default: []
    },
    deadline: {
        type: Date
    },
    private: {
        type: Boolean,
       default: true 
    },
    status: {
        type: String,
        enum: ["To Do", "In Progress", "Done", "Overdue", "Archived"],
        required: true,
        default: "To Do"
    },
    joinRequests: {
        type: [Message],
        ref: "Message"
    }
})

const Project = model("Project", ProjectSchema);

export default Project;