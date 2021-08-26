const jwt = require("jsonwebtoken");

// const config = process.env

// const verifyToken = (req,res,next) => {
//     const bearerHeader = req.body.token || req.query.token || req.headers["authorization"];

//     if (!bearerHeader) {
//         return res.status(403).json("Authentication Token Not Found")
//     }

//     try{
//         const bearer = bearerHeader.split(' ');
//         const bearerToken = bearer[1];
//         req.token = bearerToken
//         next()
//     } catch (err){
//         return res.status(401).send("Invalid Token")
//     }  
//     return next();
// }

function verifyToken(req,res,next) {
    let token = req.headers['authorization'];
    if ( !token ) return res.status(403).json({message:"Authentication Token not Found"});

    if (token ) {
        if ( token.startsWith('Bearer ') ) token = token.slice(7, token.length);
        console.log(token)
        jwt.verify(token, process.env.TOKEN_KEY, (err,decoded)=>{
            if (err) {console.log(err); return res.status(401).json({message: 'Token is not valid'}) };

            if (decoded) {
                req.decoded = decoded;
                next();
            } 
        })
    }
}

module.exports = verifyToken;