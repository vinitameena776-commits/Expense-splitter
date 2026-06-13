const jwt=require('jsonwebtoken');
const protect=(req,res,next) =>{
    try{
        //Step 1:Get token from request header
        const authHeader=req.headers=req.header.authorization;
        if(!authHeader || !authHeader.startWith)
    }
}