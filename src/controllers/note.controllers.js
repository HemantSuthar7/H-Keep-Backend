import {asyncHandler} from "../utils/ascyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinary} from "../utils/FileUpload.js"
import {deleteFromCloudinary} from "../utils/FileDelete.js"
import {Note} from "../Models/Note.models.js"
import {Label} from "../Models/Label.models.js"


/*

    Some methods to write in here : 
        1. Create Note

        2. Get User Notes (the whole read operation of getting user lists and notes will be provided in user controller)

        3. Update Note

        4. Delete Note


    << NOTE COMPONENTS : 
        1. Title
        2. textContent
        3. Image
        4. Label (will not be provided by not itself, handle this in label controller)
        5. color

*/


const createNote = asyncHandler( async (req, res) => {

    // 1. Get the title, textContent, image, color, label
    // 2. Check for empty values
    // 3. As image and color are not required, let the image field be null and color be the default which is #232427
    // 4. If image is supplied then upload it and store the url in db
    // 5. If color is supplied then store the color in db
    // 6. Store the user reference in db
    // 7. if label is supplied then reference it in db

    console.log("Received form fields:", req.body);
    console.log("Received file:", req.file);
    

    const {title, textContent, color, label, imageUrl} = req.body; // remember to receive image later

    console.log("Received data:", { title, textContent, label, color }); 
    
    if (
        [title, textContent, color, label, imageUrl].some(field => field !== undefined && typeof field !== "string")
    ) {
        throw new ApiError(400, "One or more fields have a type other than string. Please check your input.");
    }


    if (
        [title, textContent, color].some(field => field !== undefined && field.trim() === "")
    ) {
        throw new ApiError(400, "Empty values are being passed, please check for empty values");
    }



    // Handle title

    if(!title){
        throw new ApiError(400, "The title is not being passed, please ckeck")
    }

    if(title.length > 150){
        throw new ApiError(400, "The length of the title exceeds 150 characters, which is not allowed")
    }

    const titleToSave = String(title) || "Untitled" // just to ensure data type safety


    // Handle textContent

    if(!textContent){
        throw new ApiError(400, "The text-content is not being passed, please ckeck")
    }

    if(textContent.length > 50000){
        throw new ApiError(400, "The length of the text-content exceeds 50000 characters, which is not allowed")
    }

    const textContentToSave = String(textContent) // just to ensure data type safety


    // Handle color

    // ❌❌❌🚫🚫🚫🛑 WARNING !!!! : Make sure that color is one of these only : ,"#256377","#0C625D","#264D3B","#77172E","#284255","#472E5B","#6C394F","#692B17","#7C4A03","#4B443A","#232427"] , make sure no other color is passed from frontend.

    // ALSO MAKE SURE IF USER DOES NOT SELECT ANY COLOR THEN THE DEFAULT "#232427" SHOULD BE PASSED...

    if(!color){
        throw new ApiError(400, "The color is not being passed, please check")
    }

    const allowedColors = [
        "#F5D3B0", "#256377", "#0C625D", "#264D3B", "#77172E", 
        "#284255", "#472E5B", "#6C394F", "#692B17", "#7C4A03", 
        "#4B443A", "#232427"
    ];

    if (!allowedColors.includes(color)) {
        throw new ApiError(400, "Invalid color value, please check your input.");
    }

    const colorToSave = String(color)



    // Handle label

    // ❌❌🚫🚫❗❗❌❌ WARNING : If user has selected a label, then pass the labelId as the label value from frontend.


    let labelCategory;
    if (label) {
        labelCategory = await Label.findById(label);
        if (!labelCategory) {
            throw new ApiError(400, "Invalid label ID");
        }
    }


    // Handle createdBy 

    const userId = req.user._id;

    if(!userId){
        throw new ApiError(400, "User is not authenticated")
    }


    //Handle image

    const noteImageLocalPath = req.file?.path;
    let noteImageUrlToSave = null

    if(noteImageLocalPath){

        const noteImage = await uploadOnCloudinary(noteImageLocalPath)

        if(!noteImage.url){
            throw new ApiError(500, "Error occured while uploading note-image")
        }

        noteImageUrlToSave = noteImage.url
    }


    const note = await Note.create({
        title : titleToSave,
        textContent : textContentToSave,
        color : colorToSave || "#232427",
        createdBy : userId,
        labelCategory : labelCategory ? labelCategory._id : null,
        imageUrl : noteImageUrlToSave
    })

    if(!note){
        throw new ApiError(500, "There was an error while creating note")
    }



    // if everything goes well, return response

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {noteData : note}, // the noteId key is _id
            "Note created successfully"
        )
    )


} )




const getUserNotes = asyncHandler( async (req, res) => {

    const userId = req.user._id;

    if(!userId){
        throw new ApiError(400, "The user is not authenticated for retrieving notes")
    }


    const userNotes = await Note.aggregate([
        {
            $match : {
                createdBy : userId
            }
        },
        {
            $lookup : {
                from : "labels",
                localField : "labelCatgory",
                foreignField : "_id",
                as : "labelDetails"
            }
        },
        {
            $unwind : {
                path : "$labelDetails",
                preserveNullAndEmptyArrays : true
            }
        },
        {
            $project : {
                title : 1,
                textContent : 1,
                color : 1,
                imageUrl : 1,
                createdAt : 1,
                updatedAt : 1,
                "labelDetails.labelName" : 1,
                "labelDetails._id" : 1
            }
        }
    ])


    if(!userNotes || userNotes.length === 0 ){
        throw new ApiError(404, "no notes found for the user")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            { notes : userNotes },
            "User Notes retrieved successfully"
        )
    )

} )




const updateNote = asyncHandler( async (req, res) => {

    const {noteId, title, textContent, color, label} = req.body; // remember to receive image later

    console.log("The body data is : ", req.body);
    console.log("The file data is : ", req.file)


    if (
        [noteId, title, textContent, color, label].some(field => field !== undefined && typeof field !== "string")
    ) {
        throw new ApiError(400, "One or more fields have a type other than string. Please check your input.");
    }


    if (
        [noteId, title, textContent, color].some(field => field !== undefined && field.trim() === "")
    ) {
        throw new ApiError(400, "Empty values are being passed, please check for empty values");
    }


    if(!noteId){
        throw new ApiError(400, "Note-id is not being passed, please ensure its transfer")
    }

    // first get existing note by provided noteId

    const noteToUpdate = await Note.findById(noteId)

    if(!noteToUpdate){
        throw new ApiError(400, "Invalid note-id, please ensure correct note-id to be passed")
    }



    // Handle title
    if(!title){
        throw new ApiError(400, "The title is not being passed, please ckeck")
    }

    if(title.length > 100){
        throw new ApiError(400, "The length of the title exceeds 100 characters, which is not allowed")
    }

    const titleToSave = String(title) || "Untitled" // just to ensure data type safet



    // Handle textContent
    if(!textContent){
        throw new ApiError(400, "The text-content is not being passed, please ckeck")
    }

    if(textContent.length > 50000){
        throw new ApiError(400, "The length of the text-content exceeds 50000 characters, which is not allowed")
    }

    const textContentToSave = String(textContent) // just to ensure data type safety



    // Handle color
    if(!color){
        throw new ApiError(400, "The color is not being passed, please check")
    }

    const allowedColors = [
        "#F5D3B0", "#256377", "#0C625D", "#264D3B", "#77172E", 
        "#284255", "#472E5B", "#6C394F", "#692B17", "#7C4A03", 
        "#4B443A", "#232427"
    ];

    if (!allowedColors.includes(color)) {
        throw new ApiError(400, "Invalid color value, please check your input.");
    }

    const colorToSave = String(color)


    // Handle label
    
    let labelCategory;

    if (typeof label === "string" && label.trim() !== "") {
        labelCategory = await Label.findById(label);
        if (!labelCategory) {
            throw new ApiError(400, "Invalid label ID");
        }
        labelCategory = labelCategory._id
    }

    if(typeof label === "object"){
        labelCategory = null
    }


    // Handle image

    // Handle image
    const noteImageLocalPath = req.file?.path;
    let updatedNoteImageUrlToSave;

    if (noteImageLocalPath) {
        try {
            console.log("we have got the image")
            // First, upload the new image
            const noteImage = await uploadOnCloudinary(noteImageLocalPath);

            if (!noteImage.url) {
                throw new ApiError(500, "Error occurred while uploading todoList-image");
            }

            updatedNoteImageUrlToSave = noteImage.url;

            // Now, delete the old image from Cloudinary
            if (typeof noteToUpdate.imageUrl === "string") {
                const oldImageUrl = noteToUpdate.imageUrl;
                const regex = /\/upload\/[^\/]+\/([^\/]+)\./;
                const match = oldImageUrl.match(regex);

                if (match) {
                    const public_id = match[1];
                    const deleteResponse = await deleteFromCloudinary(public_id, "image");

                    if (deleteResponse?.result === "ok") {
                        console.log("Old image deleted successfully");
                    } else {
                        throw new ApiError(500, "There was an error while deleting the old todoList image");
                    }
                }
            }

        } catch (error) {
            throw new ApiError(500, "An error occurred during the image upload or deletion process");
        }
    } else {
        console.log("As we did not got the image with data, so we will delete the old one")
        updatedNoteImageUrlToSave = null;

        // If no new image is uploaded, delete the old one if it exists
        if (typeof noteToUpdate.imageUrl === "string") {
            const oldImageUrl = noteToUpdate.imageUrl;
            const regex = /\/upload\/[^\/]+\/([^\/]+)\./;
            const match = oldImageUrl.match(regex);

            if (match) {
                const public_id = match[1];
                const deleteResponse = await deleteFromCloudinary(public_id, "image");

                if (deleteResponse?.result === "ok") {
                    console.log("Old image deleted successfully");
                } else {
                    throw new ApiError(500, "There was an error while deleting the old todoList image");
                }
            }
        }
    }


    const updatedNote = await Note.findByIdAndUpdate(
        noteToUpdate._id,
        {
            $set : {
                title : titleToSave,
                textContent : textContentToSave,
                color : colorToSave,
                labelCategory : labelCategory || null,
                imageUrl : updatedNoteImageUrlToSave, 
            }
        },
        {new: true}
    )

    if(!updatedNote){
        throw new ApiError(500, "There was an error while saving the updated details to existing note")
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {updatedNoteDetails : updatedNote},
            "Note updated successfully"
        )
    )

} )



const deleteNote = asyncHandler( async (req, res) => {

    const { noteId } = req.params;

    if(!noteId){
        throw new ApiError(400, "Note ID is required for deletion")
    }

    const existingNoteDetails = await Note.findById(noteId);

    if(!existingNoteDetails){
        throw new ApiError(404, "Note not found, Note-Id is invalid")
    }

     // get the old image url

     let oldImageUrl;

     // if there exists a url
     if(typeof existingNoteDetails.imageUrl === "string"){
         oldImageUrl = existingNoteDetails.imageUrl

         const regex = /\/upload\/[^\/]+\/([^\/]+)\./;
         const match = oldImageUrl.match(regex);
         const public_id = match[1];

         const deleteResponse = await deleteFromCloudinary(public_id, "image")

         if (deleteResponse?.result === "ok") {
             console.log("old image deleted successfully")
         } else {
             throw new ApiError(500, "There was an error while deleting the old avatar file")
         }

     }


     const noteToDelete = await Note.findByIdAndDelete(noteId);

     if(!noteToDelete){
        throw new ApiError(500, "There was an error while deleting the note")
     }


     return res
     .status(200)
     .json(
        new ApiResponse(
            200,
            {},
            "Note deleted successfully"
        )
     )


} )




export {
    createNote, // TESTING => SUCCESSFULL
    getUserNotes, // TESTING => SUCCESSFULL
    updateNote, // TESTING => SUCCESSFULL
    deleteNote // TESTING => SUCCESSFULL
}