import {Schema, model} from "mongoose";

const MessageSchema = new Schema({
    timestamps: true,
    user: {
        type: Schema.Types.ObjectId,
        required: true
    },
    message: {
        type: String,
    }
})

const Message = model("Message", MessageSchema);

export default Message;