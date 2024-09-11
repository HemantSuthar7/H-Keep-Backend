import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json({limit:"16kb"})) //TO limit the amount of json data coming to the server
app.use(express.urlencoded({extended: true, limit:"16kb"}))  //the configure the URL encoding from the params
app.use(express.static("public")) // to store static files like images, documents, etc in the server itself
app.use(cookieParser()) // to successfully parse the cookies 



// Import Routes

import userRouter from "./routes/user.routes.js";
import noteRouter from "./routes/note.routes.js";
import todoListRouter from "./routes/todoList.routes.js";
import labelRouter from "./routes/label.routes.js"

// Routes Declaration

app.use("/api/v1/users", userRouter);

app.use("/api/v1/notes", noteRouter);

app.use("/api/v1/lists", todoListRouter);

app.use("/api/v1/labels", labelRouter);


export {app};