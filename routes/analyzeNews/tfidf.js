const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const express = require('express');
const router = express.Router();
const { query } = require('../../models/query');

router.post('/', (req, res)=> {
    
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
    async function getAllRelevantNews(){
        const relevantNews = await searchRelevantNews();
        const stopWords = await getStopWords();

        let allNewsIds = [];
        let allNewsStrings = [];
        let allNewsDetails=[];
        
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
    
    console.log("allStopWords: ", allStopWords);
    //------------------------------------------------------------------------- Define the algo part
    let tokenize = (text)=>text.toLowerCase().split(/[.,?!\s’]+/g);

    function ignoreStopTokens(token){
        if(!allStopWords.includes(token)){
            let filteredTokenList = [];
            filteredTokenList.push(token);
            return filteredTokenList;
        }
    }
    

    let makeDictionary = (tokens, array)=>{
        tokens.forEach((token)=>{
            if(!array.includes(token)){
                array.push(token);
            }
        })
        return array
    }

    function vsm(eachWord, endArray){
        return endArray.map(getEachWordCount);
        function getEachWordCount(singleWord){
            const wordCount = eachWord.reduce(reducer,0) //starting value = 0
            function reducer(acc, curr){
                if(curr==singleWord){
                    acc = acc +1;
                }else{
                    acc;
                }
                return acc;
            }
            return wordCount;
        }  
    }

    function termFrequency(vsm,numberofWords){
        return vsm.map(getEachTermFreq);
        function getEachTermFreq(item){
            return item/numberofWords;
        }
    }

    function logBase10(val){
        return Math.log(val)/Math.log(10);
    }

    function idf(n,newsWords,wordBags){
        return wordBags.map(calIdfforEachWord);
        function calIdfforEachWord(items){
            const idfcal= logBase10(n/(newsWords.reduce(reducer,0))); //n is number of articles to compare
            function reducer(acc,curr){
                if(curr.includes(items)){
                    acc += 1;
                }else{
                    acc = acc;
                }
                return acc;
            }
            return idfcal;
        }
    }

    function tfidf(tf, idf){
        return tf.map(combinedCal)
        function combinedCal(element,index){
            return element*idf[index];
        }
    }

    function cosine(tfIdf1,tfIdf2){
        let nominator = tfIdf1.reduce(calNominator,0);
        let deNominator1 = Math.sqrt(tfIdf1.reduce(sumSquares,0));
        let deNominator2 = Math.sqrt(tfIdf2.reduce(sumSquares,0));
        let finalcousine = nominator/(deNominator1*deNominator2);
        function calNominator(acc, curr, index){
            return acc = acc+curr*tfIdf2[index];  // each element in tfIdf1 * each element in efIdf2
        }
        function sumSquares(acc, curr){
            acc = acc+curr*curr;
            return acc;
        }
        return finalcousine;
    }

    //------------------------------------------------------------------------------------------ Calculation Part
    let newsWords = [];
    newsWords = allNewsStrings.map(tokenize);
    let filterednewsWords = ignoreStopTokens(newsWords);
    console.log("filterednewsWords: ", filterednewsWords);
    
    let bagOfWords = [];
    let finalArray = [];

    console.log("newsWords: ",newsWords)

    for (i=0; i<newsWords.length;i++){
        finalArray = makeDictionary(newsWords[i],bagOfWords);
    }
    console.log("bagOfWords: ", bagOfWords);
    
    
    let newsVsms = [];
    for (i=0; i<newsWords.length;i++){
        newsVsms.push(vsm(newsWords[i],finalArray));
    }

    let tfs = [];
    for (i=0; i<newsWords.length;i++){
        tfs.push(termFrequency(newsVsms[i],newsWords[i].length));
    }

    let newsIdf = idf(allNewsStrings.length,newsWords,bagOfWords);

    let tfidfs = [];
    for(i=0; i<tfs.length; i++){
        tfidfs.push(tfidf(tfs[i], newsIdf));
    }

    
    let firstIndex = [];
    let secondIndex = [];
    let allCosines = [];
    
    let stringCosineCombination = [];
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
    console.log("maxNonEqualCosine: ", maxNonEqualCosine);

    function getIndex(value){
        return value == maxNonEqualCosine;
    }

    var indexOfMaxNonEqualCosine = allCosines.findIndex(getIndex);
    var firstStringId = stringCosineCombination[indexOfMaxNonEqualCosine].firstString;
    var secondStringId = stringCosineCombination[indexOfMaxNonEqualCosine].secondString;

    console.log("firstStringId: ", firstStringId, "secondStringId: ", secondStringId);
    
    console.log("allNewsDetails: ", allNewsDetails);
    
    //------------------------------------------------------------------------------------------ Export final output Part
    res.send(allNewsDetails);
        
    }
    getAllRelevantNews();
    
})


module.exports = router;