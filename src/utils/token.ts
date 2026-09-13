import jwt from "jsonwebtoken" ;

export const generateAccessToken=(userId:string)=>{

    if(!userId){
        throw new Error('User Id is null')
    }

    return jwt.sign(
        {sub:userId},
        process.env.JWT_ACCESS_SECRET!,
        {expiresIn:"15min"}
    )


}

export const verifyAccessToken = (token:string)=>{
    if(!token){
        throw new Error('token is required')
    }

    const decoded = jwt.verify(token,process.env.JWT_ACCESS_SECRET!)
    return decoded
}