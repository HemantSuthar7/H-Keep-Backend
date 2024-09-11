import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/ascyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../Models/User.models.js";



export const verifyJWT = asyncHandler( async (req, res, next) => {
    try {
        console.log("verifyJWT is running")
        const token =  req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log(decodedToken)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        console.log("Error from verifyJWT")
        throw new ApiError(500, error?.message || "Something went wrong while verifying JWT")
    }

} )