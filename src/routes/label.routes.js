import {Router} from "express"

import {
    createLabel,
    getLabelData,
    updateLabel,
    deleteLabel
} from "../controllers/label.controllers.js"

import { verifyJWT } from "../middlewares/auth.middleware.js"



const labelRouter = Router();


// Routes declaration

labelRouter.route("/create-Label").post(verifyJWT, createLabel);
labelRouter.route("/get-Label-Data/:labelId").get(verifyJWT, getLabelData);
labelRouter.route("/update-Label").patch(verifyJWT, updateLabel);
labelRouter.route("/delete-Label/:labelId").get(verifyJWT, deleteLabel);



export default labelRouter;