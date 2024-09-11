import { v2 as cloudinary} from "cloudinary";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});



const deleteFromCloudinary = async (public_id, resource_type) => {

    try {
        
        if (!public_id && !resource_type) {
            console.log(" !!! ERROR FROM FileDelete utility !!!! : Arguements not present")
            return null
        }

        if (resource_type === "image") {
            const response = await cloudinary.uploader.destroy(public_id) // not including resource_type as the default is image only
            return response
        }

        if (resource_type === "video") {
            const response = await cloudinary.uploader.destroy(public_id, {resource_type: 'video'})
        }

    } catch (error) {
        console.log(` !!! ERROR FROM FileDelete Utility !!!! : COULD NOT DELETE FILE SUCCESSFULLY. | ERROR : ${error}`)
        return null
    }

}



export {deleteFromCloudinary};