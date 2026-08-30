import {Request,Response,NextFunction} from 'express'
import { ObjectSchema,ValidationError } from 'yup'

export const validateYupSchema=(schema:ObjectSchema<any>)=>async(req:Request,res:Response,next:NextFunction)=>{
try {
    await schema.validate({
        body:req.body,
        query:req.query,
        params:req.params
    })
    return next()
} catch (error) {
    if(error instanceof ValidationError){
        return res.status(400).json({
            error:error.errors
        })       
    }
    return next(error);
}
} 
