const express = require('express');
const router = express.Router();
const { query } = require('../../models/query');
const { NlpManager } = require('node-nlp');
const natural = require('natural');

const tokenizer = new natural.WordTokenizer();

router.get('/',(req, res) => {
    async function getFoxWebData(){
        sql = "SELECT id, published_time, saved_date FROM politicmotion.news_rawdata  WHERE news_source = 'Fox News' AND published_date IS NULL ORDER BY id ASC;"
        var sqlquery = await query(sql);
        return sqlquery;
    }
    async function getFBData(){
        sql = "SELECT id, post_time FROM politicmotion.fb_rawdata WHERE post_date IS NULL ORDER BY id ASC;"
        var sqlquery = await query(sql);
        return sqlquery;
    }
    
    async function tokenizeTime(){
        sqlFoxResult = await getFoxWebData();
        const idsFox = sqlFoxResult.map(getUniqueId);
        const tokenedTimesFox = sqlFoxResult.map(relativeToAbsTime);

        sqlFBResult = await getFBData();
        const idsFB = sqlFBResult.map(getUniqueId);
        const tokenedTimesFB = sqlFBResult.map(textToAbsTime);
        
        function getUniqueId(news){
            const idList = news.id;
            return idList;
        }

        function relativeToAbsTime(news){
            const tokenizedTime = tokenizer.tokenize(news.published_time);
            const savedDate = news.saved_date;
            
            if(tokenizedTime[1] == 'day'){
                const savedDateYear = savedDate.getYear()+1900;
                const savedDateMonth = savedDate.getMonth();
                const savedDateDate = savedDate.getDate();
                var published_date = new Date(savedDateYear, savedDateMonth, savedDateDate-1, '00','00');
            }else if (tokenizedTime[1] == 'days'){
                const savedDateYear = savedDate.getYear()+1900;
                const savedDateMonth = savedDate.getMonth();
                const savedDateDate = savedDate.getDate();
                var published_date = new Date(savedDateYear, savedDateMonth, savedDateDate-tokenizedTime[0], '00','00');
            }else if(tokenizedTime[1] == 'month'){
                const savedDateYear = savedDate.getYear()+1900;
                const savedDateMonth = savedDate.getMonth();
                const savedDateDate = savedDate.getDate();
                var published_date = new Date(savedDateYear, savedDateMonth-1, savedDateDate, '00','00');
            }else if(tokenizedTime[1] == 'months'){
                const savedDateYear = savedDate.getYear()+1900;
                const savedDateMonth = savedDate.getMonth();
                const savedDateDate = savedDate.getDate();
                var published_date = new Date(savedDateYear, savedDateMonth-tokenizedTime[0], savedDateDate, '00','00');
            }else if(tokenizedTime[1] == 'year'){
                const savedDateYear = savedDate.getYear()+1900;
                const savedDateMonth = savedDate.getMonth();
                const savedDateDate = savedDate.getDate();
                var published_date = new Date(savedDateYear-1, savedDateMonth, savedDateDate, '00','00');
            }else if(tokenizedTime[1] == 'years'){
                const savedDateYear = savedDate.getYear()+1900;
                const savedDateMonth = savedDate.getMonth();
                const savedDateDate = savedDate.getDate();
                var published_date = new Date(savedDateYear-tokenizedTime[0], savedDateMonth, savedDateDate, '00','00');
            }else if(tokenizedTime[1] == 'hour' || tokenizedTime[1] == 'hours' || tokenizedTime[1] == 'min' || tokenizedTime[1] == 'mins'){
                var published_date = savedDate;
            }else{
                console.log("published_date format unrecognized!")
                var published_date = savedDate;
            }
            return published_date;
        }

        function textToAbsTime(news){
            const FBTokenizedTime = tokenizer.tokenize(news.post_time);
            const FBsqlFormatDate = FBTokenizedTime[0]+"-"+FBTokenizedTime[1]+"-"+FBTokenizedTime[2];
            return FBsqlFormatDate;
        }

        return [idsFox, tokenedTimesFox, idsFB, tokenedTimesFB];
    }
    

    async function savePublishedDate(){

        const processedTimeResult = await tokenizeTime();
        console.log(processedTimeResult[0],processedTimeResult[1],processedTimeResult[2],processedTimeResult[3]);

        for (i=0; i<processedTimeResult[0].length; i++){
            const newsUniqueId = processedTimeResult[0][i];
            const processedPublishedDate = processedTimeResult[1][i];
            const sqlFormatYear = processedPublishedDate.getYear()+1900;
            const sqlFormatMonth = processedPublishedDate.getMonth()+1;
            const sqlFormatDate = processedPublishedDate.getDate();
            const finalsqlFormatDate = sqlFormatYear + "-" + sqlFormatMonth + "-" + sqlFormatDate;
            
            sql = `UPDATE news_rawdata SET published_date='${finalsqlFormatDate}' WHERE id=${newsUniqueId}`
            var sqlquery = await query(sql);
            console.log("DONE Fox-Web published_date id = ", newsUniqueId);
            sqlquery;
        }
        
        for (i=0; i<processedTimeResult[2].length; i++){
            const FBnewsUniqueId = processedTimeResult[2][i];
            const FBfinalsqlFormatDate = processedTimeResult[3][i];
            sql = `UPDATE fb_rawdata SET post_date='${FBfinalsqlFormatDate}' WHERE id=${FBnewsUniqueId}`
            var sqlquery = await query(sql);
            
            console.log("DONE FB post_date id = ", FBnewsUniqueId);
            sqlquery;
        }
        console.log("Done inserting post dates!");

        return "success!";
    }
    savePublishedDate()

    res.send('Now at Segment Topic route!');

})

module.exports = router;