const express = require('express');
const router = express.Router();
const { query } = require('../models/query');
const { NlpManager } = require('node-nlp');
const natural = require('natural');

const manager = new NlpManager;
const tokenizer = new natural.WordTokenizer();
// console.log(tokenizer.tokenize("I am happy!"))

router.get('/',(req, res) => {
    async function getFBNYTData(){
        sql = "SELECT id, published_time, saved_date FROM politicmotion.news_rawdata  WHERE news_source = 'Fox News' ORDER BY id ASC LIMIT 10;"
        let sqlquery = await query(sql);
        return sqlquery;
    }
    async function tokenizeTime(){
        sqlResult = await getFBNYTData()
        const ids = sqlResult.map(getUniqueId)
        const tokenedTimes = sqlResult.map(relativeToAbsTime) 
        
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
            }else{
                console.log("published_date format unrecognized!")
                var published_date = savedDate;
            }
            return published_date;
        }

        return [ids, tokenedTimes];
    }

    async function savePublishedDate(){
        
        
        const processedTimeResult = await tokenizeTime();
        const newsUniqueId = processedTimeResult[0];
        const processedPublishedDate = processedTimeResult[1];
        

    }
    savePublishedDate()

    
    


    res.send('Now at Segment Topic route!');

})

module.exports = router;