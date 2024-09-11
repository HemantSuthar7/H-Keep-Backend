import {asyncHandler} from "../utils/ascyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Label} from "../Models/Label.models.js"
import {TodoList} from "../Models/TodoList.models.js"
import {uploadOnCloudinary} from "../utils/FileUpload.js"
import {deleteFromCloudinary} from "../utils/FileDelete.js"

/*


    << All list components : 
        1. title
        2. listItems
        3. image
        4. label
        5. color
    >>



    Some methods to write in here : 
        1. Create list 

        2. Get User lists

        3. Update list (the whole read operation of getting user lists and notes will be provided in user controller)

        4. Delete list 


*/



const createList = asyncHandler( async (req, res) => {

    console.log("The createList is being accessed by frontend part")


    const {title, todoItems, label, color} = req.body;


    if(
        [title, label, color].some( field => field !== undefined && typeof field !== "string" )
    ){
        throw new ApiError(400, "One or more fields have a type other than string. Please check your input.")
    }


    if(
        [title, label, color].some( field => field !== undefined && field.trim() === "" )
    ){
        throw new ApiError(400, "Empty values are being passed, please check for empty values")
    }



    // Handle todoItems


    if(!todoItems){
        throw new ApiError(400, "the todo-items is not being passed, please ensure correct transfer")
    }


    const parsedTodoItems = todoItems.map(item => {
        try {
            return JSON.parse(item);
        } catch (error) {
            throw new ApiError(400, "Invalid todoItem format. Could not parse JSON.");
        }
    });


    if(!Array.isArray(parsedTodoItems)){
        throw new ApiError(400, "The todo items is not an array, please ensure the correct data type")
    }
 
    if(parsedTodoItems.length === 0){
        throw new ApiError(400, "The todo-items cannot be empty")
    }


    // check if every element is an object and every object should have two keys "value" & "status" and further these keys should not be empty, null or undefined
    for(let i = 0; i < parsedTodoItems.length; i++){
        const item = parsedTodoItems[i];

        if(typeof item !== "object" || item === null){
            throw  new ApiError(400, `Item at index ${i} is not an object`)
        }

        if(!item.hasOwnProperty("value")){
            throw new ApiError(400, `Item at index ${i} is missing the 'value' key`);
        }

        if(typeof item.value !== 'string'){
            throw new ApiError(400, `value of current todoItem object at index ${i} is not string`)
        }

        if(item.value === "" || item.value === null || item.value === undefined){
            throw new ApiError(400, `The 'value' key in item at index ${i} cannot be empty, null, or undefined`);
        }

        if(!item.hasOwnProperty("status")){
            throw new ApiError(400, `Item at index ${i} is missing the 'status' key`);
        }

        if(typeof item.status !== 'boolean'){
            throw new ApiError(400, `status of current object at index ${i} is not a boolean`)
        }

        if (item.status === null || item.status === undefined) {
            throw new ApiError(400, `The 'status' key in item at index ${i} cannot be null or undefined`);
        }

    }

    const todoItemsToSave = parsedTodoItems



    // Handle title

    if(!title){
        throw new ApiError(400, "The title is not being passed, please ckeck")
    }

    if(title.length > 100){
        throw new ApiError(400, "The length of the title exceeds 100 characters, which is not allowed")
    }

    const titleToSave = String(title) || "Untitled" // just to ensure data type safety


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

    // Handle image

    const listImageLocalPath = req.file?.path;
    let listImageUrlToSave = null

    if(listImageLocalPath){

        const listImage = await uploadOnCloudinary(listImageLocalPath)

        if(!listImage.url){
            throw new ApiError(500, "Error occured while uploading list-image")
        }

        listImageUrlToSave = listImage.url
    }


    const todoList = await TodoList.create({
        title : titleToSave,
        todoItems : todoItemsToSave,
        createdBy : userId,
        color : colorToSave || "#232427",
        labelCategory : labelCategory ? labelCategory._id : null,
        imageUrl : listImageUrlToSave
    })


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {data : todoList},
            "List created successfully"
        )
    )

} )



const updateList = asyncHandler( async (req, res) => {
    
    const {todoListId, title, todoItems, label, color} = req.body;

    console.log("the req.file data is : ", req.file)
    console.log("the req.body data is : ", req.body)

    
    if(
        [todoListId, title, label, color].some( field => field !== undefined && typeof field !== "string" )
    ){
        throw new ApiError(400, "One or more fields have a type other than string. Please check your input.")
    }

    if(
        [todoListId, title, label, color].some( field => field !== undefined && field.trim() === "" )
    ){
        throw new ApiError(400, "Empty values are being passed, please check for empty values")
    }



    if(!todoListId){
        throw new ApiError(400, "todoList-id is not being passed, please ensure its transfer")
    }

    const todoListToUpdate = await TodoList.findById(todoListId);

    if(!todoListToUpdate){
        throw new ApiError(400, "Invalid todoList-id, please ensure correct todoList-id to be passed")
    }




    // Handle title

    
    if(!title){
        throw new ApiError(400, "The title is not being passed, please ckeck")
    }

    if(title.length > 100){
        throw new ApiError(400, "The length of the title exceeds 100 characters, which is not allowed")
    }

    const titleToSave = String(title) || "Untitled" // just to ensure data type safety



    // Handle todoItems 

    if(!todoItems){
        throw new ApiError(400, "the todo-items is not being passed, please ensure correct transfer")
    }

    const parsedTodoItems = todoItems.map(item => {
        try {
            return JSON.parse(item);
        } catch (error) {
            throw new ApiError(400, "Invalid todoItem format. Could not parse JSON.");
        }
    });

    if(!Array.isArray(parsedTodoItems)){
        throw new ApiError(400, "The todo items is not an array, please ensure the correct data type")
    }
 
    if(parsedTodoItems.length === 0){
        throw new ApiError(400, "The todo-items cannot be empty")
    }


    // check if every element is an object and every object should have two keys "value" & "status" and further these keys should not be empty, null or undefined
    for(let i = 0; i < parsedTodoItems.length; i++){
        const item = parsedTodoItems[i];

        if(typeof item !== "object" || item === null){
            throw  new ApiError(400, `Item at index ${i} is not an object`)
        }

        if(!item.hasOwnProperty("value")){
            throw new ApiError(400, `Item at index ${i} is missing the 'value' key`);
        }

        if(typeof item.value !== 'string'){
            throw new ApiError(400, `value of current todoItem object at index ${i} is not string`)
        }

        if(item.value === "" || item.value === null || item.value === undefined){
            throw new ApiError(400, `The 'value' key in item at index ${i} cannot be empty, null, or undefined`);
        }

        if(!item.hasOwnProperty("status")){
            throw new ApiError(400, `Item at index ${i} is missing the 'status' key`);
        }

        if(typeof item.status !== 'boolean'){
            throw new ApiError(400, `status of current object at index ${i} is not a boolean`)
        }

        if (item.status === null || item.status === undefined) {
            throw new ApiError(400, `The 'status' key in item at index ${i} cannot be null or undefined`);
        }

    }

    const todoItemsToSave = parsedTodoItems


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
    if (label) {
        labelCategory = await Label.findById(label);
        if (!labelCategory) {
            throw new ApiError(400, "Invalid label ID");
        }
    }



    // Handle image

    // Handle image
const todoListImageLocalPath = req.file?.path;
let updatedTodoListImageUrlToSave;

if (todoListImageLocalPath) {
    try {
        console.log("we have got the image")
        // First, upload the new image
        const todoListImage = await uploadOnCloudinary(todoListImageLocalPath);

        if (!todoListImage.url) {
            throw new ApiError(500, "Error occurred while uploading todoList-image");
        }

        updatedTodoListImageUrlToSave = todoListImage.url;

        // Now, delete the old image from Cloudinary
        if (typeof todoListToUpdate.imageUrl === "string") {
            const oldImageUrl = todoListToUpdate.imageUrl;
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
    updatedTodoListImageUrlToSave = null;

    // If no new image is uploaded, delete the old one if it exists
    if (typeof todoListToUpdate.imageUrl === "string") {
        const oldImageUrl = todoListToUpdate.imageUrl;
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







    // if everything is good, then update the todoList via the provided todoListId

    const updatedTodoList = await TodoList.findByIdAndUpdate(
        todoListToUpdate._id,
        {
            $set : {
                title : titleToSave,
                todoItems : todoItemsToSave,
                color : colorToSave,
                labelCategory : labelCategory ? labelCategory._id : null,
                imageUrl : updatedTodoListImageUrlToSave

            }
        },
        {
            new : true
        }
    )

    if(!updatedTodoList){
        throw new ApiError(500, "There was an error while updating the existing todoList")
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {updatedTodoList},
            "Todo-List updated successfully"
        )
    )

} )



const deleteList = asyncHandler( async (req, res) => {

    console.log("the delete list method is being accessed")

    const { todoListId } = req.params;

    console.log("the received todoListId is : ", todoListId)

    if(!todoListId){
        throw new ApiError(400, "todoList-id is required for deletion")
    }

    const existingTodoListDetails = await TodoList.findById(todoListId)

    if(!existingTodoListDetails){
        throw new ApiError(404, "todoList not found, todoList-id invalid")
    }


    // get the old image url

    let oldImageUrl;

    // if there exists a url
    if(typeof existingTodoListDetails.imageUrl === "string"){
        oldImageUrl = existingTodoListDetails.imageUrl

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


    const todoListToDelete = await TodoList.findByIdAndDelete(existingTodoListDetails._id)

    if(!todoListToDelete){
        throw new ApiError(500, "There was an error while deleting the todoList")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "TodoList deleted successfully"
        )
    )

} )



export {
    createList, // TESTING => SUCCESSFULL
    updateList, // TESTING => SUCCESSFULL
    deleteList // TESTING => SUCCESSFULL
}