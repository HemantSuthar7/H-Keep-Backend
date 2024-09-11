import {Router} from "express"

import {
    createNote,
    getUserNotes,
    updateNote,
    deleteNote
} from "../controllers/note.controllers.js"

import { verifyJWT } from "../middlewares/auth.middleware.js"

import {upload} from "../middlewares/multer.middleware.js"


const noteRouter = Router();


// Routes declaration 

noteRouter.route("/create-Note").post(verifyJWT, upload.single("image"), createNote);
noteRouter.route("/get-User-Notes").get(verifyJWT, getUserNotes);
noteRouter.route("/update-Note").patch(verifyJWT, upload.single("image"), updateNote);
noteRouter.route("/delete-Note/:noteId").get(verifyJWT, deleteNote); // we have to supply noteId through params




export default noteRouter;