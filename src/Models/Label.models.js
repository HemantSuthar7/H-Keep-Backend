import mongoose, { Schema } from "mongoose";

const LabelSchema = new Schema({
    labelName: {
        type: String,
        maxlength: 25,
        required: [true, "Label name is required"]
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

export const Label = mongoose.model("Label", LabelSchema);