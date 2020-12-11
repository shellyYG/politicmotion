const express = require('express');
const router = express.Router();
const path = require('path');


router.get('/',(req, res, next)=>{
    res.send('welcome to chat room!');
})


module.exports = router;