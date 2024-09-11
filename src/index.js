import { app } from "./app.js"
import connectDB from "./DB/index.js"
import dotenv from 'dotenv';



dotenv.config();



connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("ERROR",error)
        throw error
    })
    app.listen(process.env.PORT || 4000 || 4500 || 5500, ()=>{
        console.log(`⚙⚙ Server is running on port ${process.env.PORT}`)
    })
    
})
.catch((err)=>{
    console.log("MonogoDB connection failed !!!",err)
})