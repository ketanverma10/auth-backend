import { Router } from "express";
import { validateYupSchema } from "../middlewares/validateYupSchema.js";
import {registerSchema} from "../schemas/auth.schema.js"

const router=Router()

router.post('/register', validateYupSchema(registerSchema),(req,res)=>{
    res.json({
        message:'Validation is succesfull',
        body:req.body
    })
})


export default router;