const jwt=require('jsonwebtoken');
const protect=(req,res,next) =>{
    try{
        //Step 1:Get token from request header
        const authHeader=req.headers=req.header.authorization;
        if(!authHeader || !authHeader.startWith('Bearer')){
            return res.status(401).json({
                message:'No token provided. Access denied.'
            });
        }

        //Step 2:Extract tokken (remove "Bearer" prefix)
        const token =authHeader.split(' ')[1];

        //Step 3:Verify token using our secret
        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        //Step 4:Attach iserId to request
    }
}