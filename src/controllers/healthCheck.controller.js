import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    
    const {check} = req.body

    if(check === "Mahadev"){
        res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    result: "Health is good"
                },
                "Health is great"
            )
        )
    }
    else{
        new ApiError(
            500,
            "Health is Bad because data is not flowing"
        )
    }

})

export {
    healthcheck
}
    