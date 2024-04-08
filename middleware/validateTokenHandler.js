const jwt = require('jsonwebtoken');

const validateToken = async (req, res, next) => {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;

    if(authHeader && authHeader.startsWith("Bearer")) {
        token  = authHeader.split(" ")[1]; 
    } else {
        token = authHeader;
    }

    if(!token) {
        res.status(401).json({message: "Token is missing"});
        return;
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) {
            res.status(401).json({error: "User is not authorized"});
            return;
        }
        console.log(decoded);

        req.user = decoded.user;
        next();
    });
};

module.exports = validateToken;