const jwt = require("jsonwebtoken");
const JWT_SECRET = 'udayisagood@$boy';

const fetchUser = (req, res, next)=>{
    // Get the User from the jwt token and add ID to the req object 
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error : "Please authenticate using a valid token"});
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();        
    } catch (error) {
        res.status(401).send({error : "Please authenticate using a valid token"});
    }

}

module.exports = fetchUser;