import {Router} from "express"

import  {
    createList,
    updateList,
    deleteList
} from "../controllers/todoList.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js"

import {upload} from "../middlewares/multer.middleware.js"


const todoListRouter = Router();


// Routes declaration

todoListRouter.route("/create-TodoList").post(verifyJWT, upload.single("image"), createList);
todoListRouter.route("/update-TodoList").patch(verifyJWT, upload.single("image"), updateList);
todoListRouter.route("/delete-TodoList/:todoListId").get(verifyJWT, deleteList);



export default todoListRouter;