// const express = require('express');
// const router = express.Router();

// router.post('/', verifyToken, (req, res)=>{

// })

// function verifyToken(req, res, next){
//     const bearerHeader=req.headers['authorization'];
    
//     if(typeof bearerHeader !== 'undefined'){
//         const bearer = bearerHeader.split(' ');
//         const bearerToken = bearer[1];
//         req.token = bearerToken;
//         next()
//     }else{
//         res.sendStatus(403); //forbidden status
//     }
// }

// module.exports = router;