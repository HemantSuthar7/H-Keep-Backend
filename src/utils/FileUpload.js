import { v2 as cloudinary} from "cloudinary";
import fs from "fs";


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});
    
  
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            console.log(" !!! ERROR FROM FileUpload utility !!!! : Local file Path not present")
            return null
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // console.log("File has been uploaded successfully", response.url);
        fs.unlinkSync(localFilePath)

        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null
    }
}


export {uploadOnCloudinary};