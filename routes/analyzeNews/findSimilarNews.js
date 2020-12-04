const express = require('express');
const router = express.Router();
const { query } = require('../../models/query');
const { makeDictionary, vsm, termFrequency, idf, tfidf, cosine } = require('../../models/tfidf');

router.post('/', (req, res)=> {
    //------------------------------------------------------------------------- Define the algo part
    let tokenize = (text)=>text.toLowerCase().split(/[.,?!\s’]+/g);

    function ignoreStopTokens(acc,curr){
        if(!allStopWords.includes(curr)){
            acc.push(curr);
        }else{
            acc;
        }
        return acc;
    }

    //------------------------------------------------------------------------------------------ Finish Algo Part
    const searchTopic1 = req.body.searchTopic1;
    const searchTopic2 = req.body.searchTopic2;
    let allStopWords = [];
    //------------------------------------------------------------------------------------------ Get String Part
    async function searchRelevantNews(){
        sql = `SELECT id, content, post_date, post_link, reaction,  sentiment_score, magnitude_score 
                FROM fb_rawdata 
                WHERE content LIKE '%${searchTopic1}%' 
                    AND content LIKE '%${searchTopic2}%' 
                ORDER BY id ASC
                LIMIT 4;` // here need to change to not limited
        var sqlquery = await query(sql);
        return sqlquery;
    }

    async function getStopWords(){
        sql = `SELECT words FROM words_stopwords;` 
        var sqlquery = await query(sql);
        return sqlquery;
    }

    let allNewsIds = [];
    let allNewsStrings = [];
    let allNewsDetails=[];
    let firstIndex = [];
    let secondIndex = [];
    let allCosines = [];
    let newsWords = [];
    let newsVsms = [];
    let tfs = [];
    let tfidfs = [];
    let bagOfWords = [];
    let finalArray = [];
    let stringCosineCombination = [];
    const AllFilteredNewsWords = [];

    async function getAllRelevantNews(){
        const relevantNews = await searchRelevantNews();
        const stopWords = await getStopWords();
        
        for (i=0; i<stopWords.length; i++){
            allStopWords.push(stopWords[i].words);
        }
        
        for (i=0; i<relevantNews.length; i++){
            allNewsIds.push(relevantNews[i].id);
            allNewsStrings.push(relevantNews[i].content);
            let singleData = {};
            singleData.NewsId = relevantNews[i].id;
            singleData.content = relevantNews[i].content
            
            allNewsDetails.push(singleData);
        }
    }

    async function getAllCosine(allNewsStrings){
        console.log("execute getAllCosine (next & outside of getAllRelevantNews)");
        await getAllRelevantNews();
        //------------------------------------------------------------------------------------------ Calculation Part
        newsWords = allNewsStrings.map(tokenize);
        
        for (i=0;i<newsWords.length;i++){
            var singleFilteredNewsWords = newsWords[i].reduce(ignoreStopTokens,[]);
            AllFilteredNewsWords.push(singleFilteredNewsWords);
        }

        for (i=0; i<AllFilteredNewsWords.length;i++){
            finalArray = makeDictionary(AllFilteredNewsWords[i],bagOfWords);
        }
        
        for (i=0; i<AllFilteredNewsWords.length;i++){
            newsVsms.push(vsm(AllFilteredNewsWords[i],finalArray));
        }

        for (i=0; i<AllFilteredNewsWords.length;i++){
            tfs.push(termFrequency(newsVsms[i],AllFilteredNewsWords[i].length));
        }

        let newsIdf = idf(allNewsStrings.length,AllFilteredNewsWords,bagOfWords);

        for(i=0; i<tfs.length; i++){
            tfidfs.push(tfidf(tfs[i], newsIdf));
        }

        for (i=0;i<tfidfs.length;i++){
            for (j=0;j<tfidfs.length;j++){
                firstIndex.push(i);
                secondIndex.push(j);
                allCosines.push(cosine(tfidfs[i],tfidfs[j]));
                let singleCombination = {};
                singleCombination.firstString = allNewsIds[i]; 
                singleCombination.secondString= allNewsIds[j]; 
                singleCombination.cosineValue = cosine(tfidfs[i],tfidfs[j]);
                stringCosineCombination.push(singleCombination);
            }
        }
        
        var thresholdCosine = 0.9;
        var maxNonEqualCosine = Math.max.apply(Math,allCosines.filter(function(x){return x <= thresholdCosine}));

        function getIndex(value){
            return value == maxNonEqualCosine;
        }
        
        var indexOfMaxNonEqualCosine = allCosines.findIndex(getIndex);
        var firstStringId = stringCosineCombination[indexOfMaxNonEqualCosine].firstString;
        var secondStringId = stringCosineCombination[indexOfMaxNonEqualCosine].secondString;

        console.log("firstStringId: ", firstStringId, "secondStringId: ", secondStringId);
        return {firstStringId,secondStringId}

    }

    getAllCosine(allNewsStrings);
    
    
    //------------------------------------------------------------------------------------------ Export final output Part
    res.send("Jo");
    
    
})


module.exports = router;