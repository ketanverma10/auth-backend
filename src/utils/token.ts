import jwt from "jsonwebtoken" ;
import { AppError } from "./AppError.js";

export const generateAccessToken=(userId:string)=>{

    if(!userId){
       throw new AppError("expiresAt is required", 400);
    }

    return jwt.sign(
        {sub:userId},
        process.env.JWT_ACCESS_SECRET!,
        {expiresIn:"15min"}
    )


}

export const verifyAccessToken = (token:string)=>{
    if(!token){
        throw new AppError("Access token is required", 401);
    }

    const decoded = jwt.verify(token,process.env.JWT_ACCESS_SECRET!)
    return decoded
}