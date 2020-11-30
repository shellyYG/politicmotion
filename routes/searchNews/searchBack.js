const express = require('express');
const router = express.Router();
const { query } = require('../../models/query');

router.post('/', (req, res, next)=>{
    const searchTopic1 = req.body.searchTopic1;
    const searchTopic2 = req.body.searchTopic2;
    async function searchNYNews(){
        sql = `SELECT content FROM fb_rawdata WHERE content LIKE '%${searchTopic1}%' AND content LIKE '%${searchTopic2}%'`
    }

    res.send('response from searchBack.');
   

})

module.exports = router;