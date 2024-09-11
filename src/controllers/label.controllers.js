import {asyncHandler} from "../utils/ascyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Label } from "../Models/Label.models.js"
import { Note } from "../Models/Note.models.js"
import {TodoList} from "../Models/TodoList.models.js"
import mongoose from "mongoose"

/*

    Some methods to write in here : 
        1. Create label (should be dynamic in the ui)

        2. Get User label data (should return all the user label associated notes and lists) 

        3. Update label 

        4. Delete label
        
        5. add more later ...S

*/


const createLabel = asyncHandler( async (req, res) => {

    const {labelName} = req.body;

    // Handle labelName

    if(!labelName){
        throw new ApiError(400, "Label-name is not being passed, please ensure its transfer")
    }

    if(typeof labelName !== "string"){
        throw new ApiError(400, "The label-name data type is not string")
    }

    if(labelName.trim() === ""){
        throw new ApiError(400, "You cannot provide empty label name")
    }

    if(labelName.length > 25){
        throw new ApiError(400, "The label-name length should not exceed 25 characters")
    }

    const labelNameToSave = String(labelName);


    // Handle createdBy

    const userId = req.user._id

    if(!userId){
        throw new ApiError(400, "The user is not authenticated for label operations")
    }


    const label = await Label.create({
        labelName : labelNameToSave,
        createdBy : userId
    })

    if(!label){
        throw new ApiError(500, "There was an error while creating label")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {label},
            "label created successfully"
        )
    )


} )



const getLabelData = asyncHandler( async (req, res) => {

    // logic for getting all the label associated data 
    //      1. get the labelId and userId
    //      2. get all the notes and lists where label category is the provided labelId
    //      3. return the notes and lists differently as each one as an array of objects
    //      4. if there is no data associated with label then also return notes and lists as empty arrays

    const { labelId } = req.params;

    console.log("The labelId received at backend is : ", labelId)

    const userId = req.user._id;


    if(!userId){
        throw new ApiError(400, "The user is not authenticated for retrieving labelData")
    }


    if (!labelId || typeof labelId !== "string" || labelId.trim() === "") {
        throw new ApiError(400, "Invalid labelId passed");
    }

    const existingLabel = await Label.findById(labelId);

    if(!existingLabel){
        throw new ApiError(404, "Label not found, invalid label-id")
    }


    const labelData = await Promise.all([
        Note.aggregate([
            {
                $match : {
                    labelCategory : new mongoose.Types.ObjectId(labelId),
                    createdBy : new mongoose.Types.ObjectId(userId)
                    // labelCategory : labelId,
                    // createdBy : userId
                }
            }
        ]),
        TodoList.aggregate([
            {
                $match : {
                    labelCategory : new mongoose.Types.ObjectId(labelId),
                    createdBy : new mongoose.Types.ObjectId(userId)
                    // labelCategory : labelId,
                    // createdBy : userId
                }
            }
        ])
    ])


    if(!labelData){
        throw new ApiError(500, "There was an issue while retrieving the label related data")
    }

    const [notes, todoLists] = labelData;


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                notes : notes || [],
                todoLists : todoLists || []
            },
            "Label data retrieved successfully"
        )
    )


} )



const updateLabel = asyncHandler( async (req, res) => {

    const {labelId, labelName} = req.body;

    if (!labelId || typeof labelId !== "string" || labelId.trim() === "" || !mongoose.Types.ObjectId.isValid(labelId)) {
        throw new ApiError(400, "Invalid labelId passed");
    }

    const existingLabel = await Label.findById(labelId);

    if(!existingLabel){
        throw new ApiError(404, "Label not found, label-id invalid")
    }

    // Handle labelName

    if(!labelName){
        throw new ApiError(400, "Label-name is not being passed, please ensure its transfer")
    }

    if(typeof labelName !== "string"){
        throw new ApiError(400, "The label-name data type is not string")
    }

    if(labelName.trim() === ""){
        throw new ApiError(400, "You cannot provide empty label name")
    }

    if(labelName.length > 25){
        throw new ApiError(400, "The label-name length should not exceed 25 characters")
    }

    const labelNameToSave = String(labelName);

    
    const updatedLabel = await Label.findByIdAndUpdate(
        labelId,
        {
            $set : {
                labelName : labelNameToSave
            }
        },
        {
            new : true
        }
    )

    if(!updatedLabel){
        throw new ApiError(500, "There was an error while updating the label name")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {updatedLabel},
            "Label updated successfully"
        )
    )


} )



const deleteLabel = asyncHandler( async (req, res) => {

    // Logic for deleting label : 
    //      1. Get the label id and userId and validate them 
    //      2. somehow set the labelcategory as null where the provided labelId is stored i.e. in notes and todoLists
    //      3. if everything goes well then return the response

    const { labelId } = req.params;
    const userId = req.user._id;

    if(!userId){
        throw new ApiError(400, "The user is not authenticated for retrieving labelData")
    }

    if (!labelId || typeof labelId !== "string" || labelId.trim() === "") {
        throw new ApiError(400, "Invalid labelId passed");
    }

    const existingLabel = await Label.findById(labelId);

    if (!existingLabel) {
        throw new ApiError(404, "Label not found, label-id invalid");
    }

    const updateNotesResult  = await Note.updateMany(
        {
            labelCategory: labelId, 
            createdBy : userId
        },
        {
            $set : {
                labelCategory : null
            }
        }
    )

    const updateTodoListsResult = await TodoList.updateMany(
        {
            labelCategory: labelId, 
            createdBy : userId
        },
        {
            $set : {
                labelCategory : null
            }
        }
    )


    if (
        (updateNotesResult.modifiedCount === 0 && updateNotesResult.matchedCount > 0) ||
        (updateTodoListsResult.modifiedCount === 0 && updateTodoListsResult.matchedCount > 0)
    ) {
        throw new ApiError(500, "Failed to update notes or todoLists with null labelCategory");
    }


    const deletedLabel = await Label.findByIdAndDelete(existingLabel._id)

    if(!deletedLabel){
        throw new ApiError(500, "There was an error while deleting the label")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Label deleted successfully"
        )
    )


} )


export {
    createLabel, // TESTING => SUCCESSFULL
    getLabelData, // TESTING => SUCCESSFULL
    updateLabel, // TESTING => SUCCESSFULL
    deleteLabel // TESTING => SUCCESSFULL
}