const { fn } = require("moment")

const wrapAsync = (func) => {
    return function(req, res, next){
        func(req, res, next).catch(next);
    }
}

const verifyToken = function(req, res, next){
    const bearerHeader=req.headers["authorization"];
    
    if(typeof bearerHeader !== "undefined"){
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }else{
        res.sendStatus(403); //forbidden status
    }
}

module.exports = {
    wrapAsync,
    verifyToken
}