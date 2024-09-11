import mongoose , {Schema} from "mongoose";

const todoItemsSchema = new Schema({
    value : {
        type : String,
        required : [true, "todo-items cannot be empty"],
        maxlength : 150
    },
    status : {
        type : Boolean,
        required : [true, "status is required"],
        default : false
    }
})

const todoListSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required in list"], // pass in a default values from controller if no title passed by user
        maxlength: 100, 
    },
    todoItems:{
        type: [todoItemsSchema],
        required: [true, "Content is required in list"],
        validate: {
            validator: function(v){
                return v.length > 0;
            },
            message: props => "The todoItems should atleast contain one item"
        }
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    color: {
        type: String,
        required: [true, "Color is required"], // pass in default value if user does not selects any color
        uppercase: true,
        enum : ["#F5D3B0","#256377","#0C625D","#264D3B","#77172E","#284255","#472E5B","#6C394F","#692B17","#7C4A03","#4B443A","#232427"]
    },
    labelCategory: {
        type: Schema.Types.ObjectId,
        ref: "Label"
    },
    imageUrl: {
        type: String, // Cloudinary URL
    }

},{timestamps:true});

export const TodoList = mongoose.model("TodoList", todoListSchema);