const express = require('express');
const router = express.Router();
const { query } = require('../../models/query');

router.post('/', (req, res, next)=>{
    const searchTopic1 = req.body.searchTopic1;
    const searchTopic2 = req.body.searchTopic2;
    async function searchNYNewsFromFB(){
        sql = `SELECT content, post_date, post_link, reaction FROM fb_rawdata WHERE post_source = 'nytimes' AND content LIKE '%${searchTopic1}%' AND content LIKE '%${searchTopic2}%' LIMIT 1;`
        var sqlquery = await query(sql);
        return sqlquery;
    }
    async function getNYNewsFromFB(){
        const NYNewsFromFB = await searchNYNewsFromFB();
        return [NYNewsFromFB[0].content, NYNewsFromFB[0].post_date, NYNewsFromFB[0].post_link, NYNewsFromFB[0].reaction];
    }

    async function searchFoxNewsFromFB(){
        sql = `SELECT content, post_date, post_link, reaction FROM fb_rawdata WHERE post_source = 'foxnews' AND content LIKE '%${searchTopic1}%' AND content LIKE '%${searchTopic2}%' LIMIT 1;`
        var sqlquery = await query(sql);
        return sqlquery;
    }
    async function getFoxNewsFromFB(){
        const FoxNewsFromFB = await searchFoxNewsFromFB();
        return [FoxNewsFromFB[0].content, FoxNewsFromFB[0].post_date, FoxNewsFromFB[0].post_link, FoxNewsFromFB[0].reaction];
    }

    async function pushDataToFront(){
        const FBNYNews = await getNYNewsFromFB();
        const FBNYNewsContent = FBNYNews[0];
        const FBNYNewsPostDate = FBNYNews[1];
        const FBNYNewsPostLink = FBNYNews[2];
        const FBNYNewsReaction = FBNYNews[3];
        console.log(FBNYNewsReaction);
        const FBFoxNews = await getFoxNewsFromFB();
        const FBFoxNewsContent = FBFoxNews[0];
        const FBFoxNewsPostDate = FBFoxNews[1];
        const FBFoxNewsPostLink = FBFoxNews[2];
        const FBFoxNewsReaction = FBFoxNews[3];
        const finalRes = {};
        finalRes.FBNYNewsContent = FBNYNewsContent;
        finalRes.FBNYNewsPostDate = FBNYNewsPostDate;
        finalRes.FBNYNewsPostLink = FBNYNewsPostLink;
        finalRes.FBNYNewsReaction = FBNYNewsReaction;
        finalRes.FBFoxNewsContent = FBFoxNewsContent;
        finalRes.FBFoxNewsPostDate = FBFoxNewsPostDate;
        finalRes.FBFoxNewsPostLink = FBFoxNewsPostLink;
        finalRes.FBFoxNewsReaction = FBFoxNewsReaction;
        
        res.json(finalRes);
    }
    pushDataToFront()
    

    
   

})

module.exports = router;