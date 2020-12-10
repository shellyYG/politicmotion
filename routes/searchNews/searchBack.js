const express = require('express');
const router = express.Router();
const { query } = require('../../models/query');

router.post('/', (req, res, next)=>{
    const searchTopic1 = req.body.searchTopic1;
    const searchTopic2 = req.body.searchTopic2;
    
    // ------------------------------------------------ Get NY News Dots
    async function searchFBNYNewsDots(){
        sql = `SELECT id, sentiment_score, magnitude_score
        FROM politicmotion.fb_rawdata
        WHERE post_source = 'nytimes' AND content LIKE '%${searchTopic1}%' AND content LIKE '%${searchTopic2}%'`
        var sqlquery = await query(sql);
        return sqlquery; 
    }

    async function searchFBFoxNewsDots(){
        sql = `SELECT id, sentiment_score, magnitude_score
        FROM politicmotion.fb_rawdata
        WHERE post_source = 'foxnews' AND content LIKE '%${searchTopic1}%' AND content LIKE '%${searchTopic2}%'`
        var sqlquery = await query(sql);
        return sqlquery; 
    }

    async function getFBNewsDots(){
        const FBNYNewsDots = await searchFBNYNewsDots();
        const FBFoxNewsDots = await searchFBFoxNewsDots();
        const finalNYTDotDict = FBNYNewsDots.map(getDotList); //actually finalNYDotDict is an array
        const finalFoxDotDict = FBFoxNewsDots.map(getDotList);

        function getDotList(dots){
            var dotDict = {}
            dotDict.uniqueId = dots.id;
            dotDict.sentimentScore = dots.sentiment_score;
            dotDict.magScore = dots.magnitude_score
            return dotDict;
        }
        
        return [finalNYTDotDict, finalFoxDotDict]
    }

    function getsentimentScore(items){
        var List = items.sentimentScore;
        return List;
    }
    function getMagScore(items){
        var List = items.magScore;
        return List;
    }

    async function makeSentimentArray(){
        var allDots = await getFBNewsDots();
        const NYSentimentScoreArray = allDots[0].map(getsentimentScore);
        const FoxSentimentScoreArray = allDots[1].map(getsentimentScore);
        return [NYSentimentScoreArray,FoxSentimentScoreArray];
    }
    async function makeMagArray(){
        var allDots = await getFBNewsDots();
        const NYmagScoreArray = allDots[0].map(getMagScore);
        const FoxmagScoreArray = allDots[1].map(getMagScore);
        return [NYmagScoreArray,FoxmagScoreArray];
    }
    

    async function pushDataToFront(){
        // ------------------------------------------------ dots
        const sentimentArray = await makeSentimentArray();
        const magnitudeArray = await makeMagArray();

        const NYSentimentArray = sentimentArray[0];
        const NYMagnitudeArray = magnitudeArray[0];
        const FoxSentimentArray = sentimentArray[1];
        const FoxMagnitudeArray = magnitudeArray[1];
        
        // ----------------------------Construct final object sent to Front-End
        const finalRes = {};

        // add dots
        finalRes.NYSentimentArray = NYSentimentArray;
        finalRes.NYMagnitudeArray = NYMagnitudeArray;
        finalRes.FoxSentimentArray = FoxSentimentArray;
        finalRes.FoxMagnitudeArray = FoxMagnitudeArray;

        res.json(finalRes);
    }
    pushDataToFront()
})



module.exports = router;