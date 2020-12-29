const express = require("express");
const router = express.Router();
const { query } = require("../../models/query");

router.post("/", (req, res)=> {
    const finalPointsClicked = req.body.finalPointsClicked;
    const searchTopic1 = req.body.searchTopic1;
    const searchTopic2 = req.body.searchTopic2;
    let pointsToShow = [];
    pointsToShow = JSON.parse(finalPointsClicked);
    const lastPoint = pointsToShow[pointsToShow.length-1];
    const secondLastPoint = pointsToShow[pointsToShow.length-2];

    console.log("lastPoint now:", lastPoint);
    console.log("secondLastPoint now:", secondLastPoint);

    async function searchLastNews(){
        sql = `SELECT content, post_date, post_link, reaction,  sentiment_score, magnitude_score 
               FROM fb_rawdata 
               WHERE content LIKE '%${searchTopic1}%' 
                     AND content LIKE '%${searchTopic2}%' 
                     AND sentiment_score = ${lastPoint.Xaxis}
                     AND magnitude_score = ${lastPoint.Yaxis}
               LIMIT 1;`;
        var sqlquery = await query(sql);
        return sqlquery;
    }
    async function searchSecondLastNews(){
        sql = `SELECT content, post_date, post_link, reaction,  sentiment_score, magnitude_score 
               FROM fb_rawdata 
               WHERE content LIKE '%${searchTopic1}%' 
                     AND content LIKE '%${searchTopic2}%' 
                     AND sentiment_score = ${secondLastPoint.Xaxis}
                     AND magnitude_score = ${secondLastPoint.Yaxis}
               LIMIT 1;`;
        var sqlquery = await query(sql);
        return sqlquery;
    }
    async function getAllNews(){
        const lastNews = await searchLastNews();
        console.log("lastNews is: ", lastNews);
        const secondLastNews = await searchSecondLastNews();
        console.log("secondLastNews is: ", secondLastNews);
        return {LastContent: lastNews[0].content,
                LastPostDate: lastNews[0].post_date,
                LastPostLink: lastNews[0].post_link,
                LastReaction: lastNews[0].reaction,
                LastSentScore: lastNews[0].sentiment_score,
                LastMagScore: lastNews[0].magnitude_score,
                SecondLastContent: secondLastNews[0].content,
                SecondLastPostDate: secondLastNews[0].post_date,
                SecondLastPostLink: secondLastNews[0].post_link,
                SecondLastReaction: secondLastNews[0].reaction,
                SecondLastSentScore: secondLastNews[0].sentiment_score,
                SecondLastMagScore: secondLastNews[0].magnitude_score
            };

    }

    async function pushToFrontEnd(){
        const newsToPush = await getAllNews();
        console.log(newsToPush);
        res.send(newsToPush);
    }
    pushToFrontEnd();
    

});

module.exports = router;