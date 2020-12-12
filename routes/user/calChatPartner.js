const express = require('express');
const router = express.Router();

router.post('/', (req, res)=>{
    console.log("SearchTopics: ", req.body.firstSearchTopic, req.body.secondSearchTopic);

})

module.exports = router;