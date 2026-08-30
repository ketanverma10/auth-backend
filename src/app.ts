import express from "express";
import cors from "cors";
import cookieParser  from "cookie-parser";
import router  from "./routes/auth.routes.js";

const app = express()


app.use(express.json());
 app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true

}))

app.use('/auth',router)
// app.get("/cookie/read",(req,res)=>{
//     console.log(req.headers.cookie);
//     res.json(req.cookies)

    
// })

// app.get("/cookie/set",(req,res)=>{
//     res.cookie('refresh_token','abc123',{
//         httpOnly:true,
//         secure:false,
//         sameSite:"lax",
//         maxAge:7 * 24 * 60 * 60 * 1000,


//     })
//     res.send('secure cookie set')
// })

// app.post("/test", (req, res) => {
//   console.log(req.body);

//   res.json({
//     received: req.body,
//   });
// });

app.get("/",(req,res)=>{
 res.send('Authentication backend is running')
})

export default app;