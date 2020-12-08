const express = require('express');
const router = express.Router();
const { query } = require('../../models/query');
const { tokenize, makeDictionary, vsm, termFrequency, idf, tfidf, cosine, unique } = require('../../models/tfidf');

router.post('/', (req, res)=> {
    //------------------------------------------------------------------------------------------ Finish Algo Part
    const searchTopic1 = req.body.searchTopic1;
    const searchTopic2 = req.body.searchTopic2;
    let clickedIds = req.body.clickedIds;
    clickedIds = JSON.parse(clickedIds);
    
    //--------------------------------------------------------------------------Get clicked news
    let allNewsIdClicked= [];
    for (i=0; i<clickedIds.length; i++){
        async function getClickedNews(){
            sql = `SELECT id, content, post_date, post_link, reaction, sentiment_score, magnitude_score
            FROM politicmotion.fb_rawdata
            WHERE content LIKE '%${searchTopic1}%' AND content LIKE '%${searchTopic2}%' 
                  AND sentiment_score = ${clickedIds[i].Xaxis} AND magnitude_score = ${clickedIds[i].Yaxis}
            LIMIT 1;`
            var sqlquery = await query(sql);
            return sqlquery; 
        }
        async function showFirstCLickedNews(){
            let ClickedNews = await getClickedNews();
            let ClickedNewsId = ClickedNews[0].id;
            // console.log("ClickedNewsId: ", ClickedNewsId);
            allNewsIdClicked.push(ClickedNewsId);
        }
        showFirstCLickedNews()
    }

    //------------------------------------------------------------------------------------------ Ignore Stop Words
    let allStopWords = [];
    function ignoreStopTokens(acc,curr){
        if(!allStopWords.includes(curr)){
            acc.push(curr);
        }else{
            acc;
        }
        return acc;
    }

    //------------------------------------------------------------------------------------------ Get String Part
    async function searchRelevantNews(){
        sql = `SELECT id, content, post_date, post_link, reaction,  sentiment_score, magnitude_score 
                FROM fb_rawdata 
                WHERE content LIKE '%${searchTopic1}%' 
                    AND content LIKE '%${searchTopic2}%' 
                ORDER BY id ASC
                ;` // here need to change to not limited
        var sqlquery = await query(sql);
        return sqlquery;
    }

    async function getStopWords(){
        sql = `SELECT words FROM words_stopwords;` 
        var sqlquery = await query(sql);
        return sqlquery;
    }

    //------------------------------------------------------------------------------------------ Start Similar Score Calculation
    let thresholdCosine = 0.9; //threshold to ignore (because same sentence will be almost 100%)
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
    const finalNewsPackage = [];

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
        await getAllRelevantNews();
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

        // console.log("stringCosineCombination: ", stringCosineCombination);
        let allMatched = [];
        for (i=0; i<allNewsIdClicked.length; i++){
            console.log("i is: ", i);
            function findSingleMatch(acc,curr){
                if(curr.firstString == allNewsIdClicked[i]){  //here
                    let clickedP = {};   
                    clickedP.firstString = curr.firstString;
                    clickedP.score = curr.cosineValue;
                    clickedP.secondString = curr.secondString;
                    acc.push(clickedP)
                    return acc;
                }else{
                    acc=acc;
                    return acc;
                }
            }
            let singleMatch = stringCosineCombination.reduce(findSingleMatch,[]);
            let matchedScores = [];
            for (j=0; j<singleMatch.length; j++){
                matchedScores.push(singleMatch[j].score);
            }
            
            var maxSingleScore = Math.max.apply(Math,matchedScores.filter(function(x){return x <= thresholdCosine}));

            function findMatchArticleId(acc,curr){
                if(curr.firstString == allNewsIdClicked[i] && curr.cosineValue == maxSingleScore){  
                    acc = curr.secondString;
                    return acc;
                }else{
                    acc=acc;
                    return acc;
                }
            }
            let matchedArticle = stringCosineCombination.reduce(findMatchArticleId,0);
            let twoMatched = {};
            
            twoMatched.firstArticle = singleMatch[0].firstString;
            twoMatched.secondString = matchedArticle;
            twoMatched.score = maxSingleScore;

            allMatched.push(twoMatched);
        }

        console.log("allMatched: ", allMatched);

        const newsIdtoShow = [];
        for (i=0; i<allMatched.length; i++){
            newsIdtoShow.push(allMatched[i].firstArticle);
            newsIdtoShow.push(allMatched[i].secondString);
        }
        let uniqueNewsIdtoShow = newsIdtoShow.filter(unique);
        
        console.log("uniqueNewsIdtoShow: ", uniqueNewsIdtoShow);
        
        async function getRelevantNews(){
            sql = `SELECT id, content, post_date, post_link, reaction, sentiment_score, magnitude_score, user_sentiment_score, user_magnitude_score
            FROM politicmotion.fb_rawdata
            WHERE id IN (${uniqueNewsIdtoShow});`
            var sqlquery = await query(sql);
            return sqlquery; 
        }

        
        async function showRelevantNews(){
            let allNews = await getRelevantNews();
            for (i=0; i<allNews.length;i++){
                let singleNews = {};
                singleNews.id = allNews[i].id;
                singleNews.content = allNews[i].content;
                singleNews.post_date = allNews[i].post_date;
                singleNews.post_link = allNews[i].post_link;
                singleNews.reaction = allNews[i].reaction;
                singleNews.sentiment_score = allNews[i].sentiment_score;
                singleNews.magnitude_score = allNews[i].magnitude_score;
                singleNews.user_sentiment_score = allNews[i].user_sentiment_score;
                singleNews.user_magnitude_score = allNews[i].user_magnitude_score;
                finalNewsPackage.push(singleNews);
            }
            console.log("finalNewsPackage: ", finalNewsPackage);
            res.json(finalNewsPackage);
            
        }
        showRelevantNews();

    }

    getAllCosine(allNewsStrings);
    
    //------------------------------------------------------------------------------------------ Export final output Part
    
    
})

module.exports = router;