const express = require('express');
const router = express.Router();
const { query } = require('../../models/query');

router.post('/', (req, res, next)=>{
    const searchTopic1 = req.body.searchTopic1;
    const searchTopic2 = req.body.searchTopic2;
    // ------------------------------------------------------------------------------------------------------ New York Times
    async function searchNYNewsFromFB(){
        sql = `SELECT content, post_date, post_link, reaction,  sentiment_score, magnitude_score FROM fb_rawdata WHERE post_source = 'nytimes' AND content LIKE '%${searchTopic1}%' AND content LIKE '%${searchTopic2}%' LIMIT 1;`
        var sqlquery = await query(sql);
        return sqlquery;
    }
    async function getNYNewsAvgScoreFB(){
        sql = `SELECT post_source, AVG(sentiment_score) AS avgSentimentScore, AVG(magnitude_score) AS avgMgtScore
        FROM politicmotion.fb_rawdata
        WHERE post_source = 'nytimes' AND content LIKE '%${searchTopic1}%' AND content LIKE '%${searchTopic2}%'
        GROUP BY post_source;`
        var sqlquery = await query(sql);
        return sqlquery; 
    }
    async function getNYNewsFromFB(){
        const NYNewsFromFB = await searchNYNewsFromFB();
        const NYAvgScoreFB = await getNYNewsAvgScoreFB();
        return [NYNewsFromFB[0].content, NYNewsFromFB[0].post_date, NYNewsFromFB[0].post_link, NYNewsFromFB[0].reaction, NYNewsFromFB[0].sentiment_score, NYNewsFromFB[0].magnitude_score, NYAvgScoreFB[0].avgSentimentScore, NYAvgScoreFB[0].avgMgtScore];
    }
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
    
    // ------------------------------------------------------------------------------------------------------ Fox News
    async function searchFoxNewsFromFB(){
        sql = `SELECT content, post_date, post_link, reaction,  sentiment_score, magnitude_score FROM fb_rawdata WHERE post_source = 'foxnews' AND content LIKE '%${searchTopic1}%' AND content LIKE '%${searchTopic2}%' LIMIT 1;`
        var sqlquery = await query(sql);
        return sqlquery;
    }
    async function getFoxAvgScoreFB(){
        sql = `SELECT post_source, AVG(sentiment_score) AS avgSentimentScore, AVG(magnitude_score) AS avgMgtScore
        FROM politicmotion.fb_rawdata
        WHERE post_source = 'foxnews' AND content LIKE '%${searchTopic1}%' AND content LIKE '%${searchTopic2}%'
        GROUP BY post_source;`
        var sqlquery = await query(sql);
        return sqlquery;
    }
    async function getFoxNewsFromFB(){
        const FoxNewsFromFB = await searchFoxNewsFromFB();
        const FoxAvgScoreFB = await getFoxAvgScoreFB();
        return [FoxNewsFromFB[0].content, FoxNewsFromFB[0].post_date, FoxNewsFromFB[0].post_link, FoxNewsFromFB[0].reaction, FoxNewsFromFB[0].sentiment_score, FoxNewsFromFB[0].magnitude_score, FoxAvgScoreFB[0].avgSentimentScore, FoxAvgScoreFB[0].avgMgtScore];
    }

    async function pushDataToFront(){

        // ------------------------------------------------ dots
        const sentimentArray = await makeSentimentArray();
        const magnitudeArray = await makeMagArray();

        const NYSentimentArray = sentimentArray[0];
        const NYMagnitudeArray = magnitudeArray[0];
        const FoxSentimentArray = sentimentArray[1];
        const FoxMagnitudeArray = magnitudeArray[1];


        const FBNYNews = await getNYNewsFromFB();
        const FBNYNewsContent = FBNYNews[0];
        const FBNYNewsPostDate = FBNYNews[1];
        const FBNYNewsPostLink = FBNYNews[2];
        const FBNYNewsReaction = FBNYNews[3];
        // const FBNYNewsSentiment = FBNYNews[4];
        // const FBNYNewsMagnitude = FBNYNews[5];
        const FBNYAvgSentiment = FBNYNews[6];
        const FBNYAvgMag = FBNYNews[7];
        
        const FBFoxNews = await getFoxNewsFromFB();
        const FBFoxNewsContent = FBFoxNews[0];
        const FBFoxNewsPostDate = FBFoxNews[1];
        const FBFoxNewsPostLink = FBFoxNews[2];
        const FBFoxNewsReaction = FBFoxNews[3];
        // const FBFoxNewsSentiment = FBFoxNews[4];
        // const FBFoxNewsMagnitude = FBFoxNews[5];
        const FBFoxAvgSentiment = FBFoxNews[6];
        const FBFoxAvgMag = FBFoxNews[7];

        
        // ----------------------------Construct final object sent to Front-End
        const finalRes = {};
        finalRes.FBNYNewsContent = FBNYNewsContent;
        finalRes.FBNYNewsPostDate = FBNYNewsPostDate;
        finalRes.FBNYNewsPostLink = FBNYNewsPostLink;
        finalRes.FBNYNewsReaction = FBNYNewsReaction;
        // finalRes.FBNYNewsSentiment = FBNYNewsSentiment;
        // finalRes.FBNYNewsMagnitude = FBNYNewsMagnitude;
        finalRes.FBNYAvgSentiment = FBNYAvgSentiment;
        finalRes.FBNYAvgMag = FBNYAvgMag;
        
        finalRes.FBFoxNewsContent = FBFoxNewsContent;
        finalRes.FBFoxNewsPostDate = FBFoxNewsPostDate;
        finalRes.FBFoxNewsPostLink = FBFoxNewsPostLink;
        finalRes.FBFoxNewsReaction = FBFoxNewsReaction;
        // finalRes.FBFoxNewsSentiment = FBFoxNewsSentiment;
        // finalRes.FBFoxNewsMagnitude = FBFoxNewsMagnitude;
        finalRes.FBFoxAvgSentiment = FBFoxAvgSentiment;
        finalRes.FBFoxAvgMag = FBFoxAvgMag;

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