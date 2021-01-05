const { tokenize, makeDictionary, vsm, termFrequency, idf, tfidf, cosine, unique } = require("../../../util/tfidf");
const showNewsContentModel = require('../../models/showNews/showNewsContentModel');

const showNews = async (req, res) => {
    console.log("req.body @showNewsContentBack: ", req.body);
    //------------------------------------------------------------------------------------------ Finish Algo Part
    const searchTopic1 = req.body.searchTopic1;
    const searchTopic2 = req.body.searchTopic2;
    const NYIdsArray = req.body.NYIdsArray;
    const FoxIdsArray = req.body.FoxIdsArray;
    var allIdsArray = [];
    FoxIdsArray.forEach((e)=>{
        allIdsArray.push(e);
    });
    NYIdsArray.forEach((e)=>{
        allIdsArray.push(e);
    });

    allIdsArray = allIdsArray.filter(function(value, index, arr){
        return value !== "";
    });
    
    allIdsArrayNum = allIdsArray.map(element=>parseInt(element,10));
    console.log("allIdsArrayNum: ", allIdsArrayNum);
    
    let clickedIds = req.body.clickedIds;
    clickedIds = JSON.parse(clickedIds);

    let clickedSources = req.body.clickedSources;
    clickedSources = JSON.parse(clickedSources);

    //--------------------------------------------------------------------------Get clicked news
    let allNewsIdClicked = [];
    if(clickedIds == null){ //prevent user from randoming clicking on to this page
        res.json([]);
    }else{
        for (i = 0; i < clickedIds.length; i++) {
            await showNewsContentModel.showFirstCLickedNews(clickedIds, i, allIdsArrayNum, allNewsIdClicked, clickedSources);
        }
        //------------------------------------------------------------------------------------------ Ignore Stop Words
        let allStopWords = [];
        function ignoreStopTokens(acc, curr) {
            if (!allStopWords.includes(curr)) {
                acc.push(curr);
            } else {
                acc;
            }
            return acc;
        }
    
        //------------------------------------------------------------------------------------------ Start Similar Score Calculation
        let thresholdCosine = 0.9; //threshold to ignore (because same sentence will be almost 100%)
        let allNewsIds = [];
        let allNewsSources = [];
        let allNewsStrings = [];
        let allNewsDetails = [];
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
    
        async function getAllRelevantNews() {
            const relevantNews = await showNewsContentModel.searchRelevantNews(allIdsArrayNum);
            const stopWords = await showNewsContentModel.getStopWords();
    
            for (i = 0; i < stopWords.length; i++) {
                allStopWords.push(stopWords[i].words);
            }
    
            for (i = 0; i < relevantNews.length; i++) {
                allNewsIds.push(relevantNews[i].id);
                allNewsSources.push(relevantNews[i].post_source);
                allNewsStrings.push(relevantNews[i].content);
                let singleData = {};
                singleData.NewsId = relevantNews[i].id;
                singleData.content = relevantNews[i].content;
                allNewsDetails.push(singleData);
            }
        }
    
        async function getAllCosine(allNewsStrings) {
            await getAllRelevantNews();
            newsWords = allNewsStrings.map(tokenize);
    
            for (i = 0; i < newsWords.length; i++) {
                var singleFilteredNewsWords = newsWords[i].reduce(ignoreStopTokens, []);
                AllFilteredNewsWords.push(singleFilteredNewsWords);
            }
    
            for (i = 0; i < AllFilteredNewsWords.length; i++) {
                finalArray = makeDictionary(AllFilteredNewsWords[i], bagOfWords);
            }
    
            for (i = 0; i < AllFilteredNewsWords.length; i++) {
                newsVsms.push(vsm(AllFilteredNewsWords[i], finalArray));
            }
    
            for (i = 0; i < AllFilteredNewsWords.length; i++) {
                tfs.push(termFrequency(newsVsms[i], AllFilteredNewsWords[i].length));
            }
    
            let newsIdf = idf(allNewsStrings.length, AllFilteredNewsWords, bagOfWords);
    
            for (i = 0; i < tfs.length; i++) {
                tfidfs.push(tfidf(tfs[i], newsIdf));
            }
    
            for (i = 0; i < tfidfs.length; i++) {
                for (j = 0; j < tfidfs.length; j++) {
                    firstIndex.push(i);
                    secondIndex.push(j);
                    allCosines.push(cosine(tfidfs[i], tfidfs[j]));
                    let singleCombination = {};
                    singleCombination.firstString = allNewsIds[i];
                    singleCombination.firstStringSource = allNewsSources[i];
                    singleCombination.secondString = allNewsIds[j];
                    singleCombination.secondStringSource = allNewsSources[j];
                    singleCombination.cosineValue = cosine(tfidfs[i], tfidfs[j]);
                    stringCosineCombination.push(singleCombination);
                }
            }
            
            let allMatched = [];
            for (i = 0; i < allNewsIdClicked.length; i++) {
                
                function findSingleMatch(acc, curr) {
                    if (curr.firstString == allNewsIdClicked[i]) {
                        let clickedP = {};
                        clickedP.firstString = curr.firstString;
                        clickedP.firstStringSource = curr.firstStringSource;
                        clickedP.score = curr.cosineValue;
                        clickedP.secondString = curr.secondString;
                        clickedP.secondStringSource = curr.secondStringSource;
                        if (clickedP.firstStringSource !== clickedP.secondStringSource) { //if from diff. news source
                            acc.push(clickedP);
                        }
    
                        return acc;
                    } else {
                        acc = acc;
                        return acc;
                    }
                }
                let singleMatch = stringCosineCombination.reduce(findSingleMatch, []);
                let matchedScores = [];
                for (j = 0; j < singleMatch.length; j++) {
                    matchedScores.push(singleMatch[j].score);
                }
    
                var maxSingleScore = Math.max.apply(Math, matchedScores.filter(function (x) { return x <= thresholdCosine; })); // search other news condition here?
    
                function findMatchArticleId(acc, curr) {
                    if (curr.firstString == allNewsIdClicked[i] && curr.cosineValue == maxSingleScore) {   //curr.cosineValue == maxSingleScore && curr.firstStringSource !== curr.secondStringSource
                        acc = curr.secondString;
                        return acc;
                    } else {
                        acc = acc;
                        return acc;
                    }
                }
                let matchedArticle = stringCosineCombination.reduce(findMatchArticleId, 0);
                let twoMatched = {};

                if (singleMatch.length == 0) { // no matched articles
                    twoMatched;
                } else {
                    twoMatched.firstArticle = singleMatch[0].firstString;
                    twoMatched.secondString = matchedArticle;
                    twoMatched.score = maxSingleScore;
    
                    allMatched.push(twoMatched);
                }
    
            }
    
            const newsIdtoShow = [];
            if (allMatched.length == 0) { // no matched news
                var uniqueNewsIdtoShow = allNewsIdClicked.filter(unique);
                var clickedNews = [];
                clickedNews = uniqueNewsIdtoShow;
    
            } else {
                for (i = 0; i < allMatched.length; i++) {
                    newsIdtoShow.push(allMatched[i].firstArticle, allMatched[i].secondString);
                }
                // console.log("newsIdtoShow: ", newsIdtoShow);
                var uniqueNewsIdtoShow = newsIdtoShow.filter(unique);
                var clickedNews = [];
                clickedNews = allMatched.map((element) => { return element.firstArticle; });
            }
    
            async function showRelevantNews() {
                let allNews = await showNewsContentModel.getRelevantNews(uniqueNewsIdtoShow);
                // console.log("allNews: ", allNews);
                if (allMatched.length == 0) {
                
                    var singleNews = {};
                    singleNews.id = allNews[0].id;
                    singleNews.content = allNews[0].content;
                    singleNews.post_date = allNews[0].post_date;
                    singleNews.post_link = allNews[0].post_link;
                    singleNews.reaction = allNews[0].reaction;
                    singleNews.sentiment_score = allNews[0].sentiment_score;
                    singleNews.magnitude_score = allNews[0].magnitude_score;
                    singleNews.user_sentiment_score = allNews[0].user_sentiment_score;
                    singleNews.user_magnitude_score = allNews[0].user_magnitude_score;
                    singleNews.post_source = allNews[0].post_source;
                    singleNews.title = allNews[0].title;
                    singleNews.small_title = allNews[0].small_title;
                    singleNews.lead_paragraph = allNews[0].lead_paragraph;
                    singleNews.paragraph = allNews[0].paragraph;
    
                    var clickedId = [];
                    var matchedId = [];
    
                    clickedId.push(clickedNews);
                    matchedId.push(0);
                    singleNews.clickedId = clickedId[0];
                    singleNews.matchedId = matchedId[0];
                    finalNewsPackage.push(singleNews);
                } else {
                    for (i = 0; i < allNews.length; i++) {
                        var singleNews = {};
                        singleNews.id = allNews[i].id;
                        singleNews.content = allNews[i].content;
                        singleNews.post_date = allNews[i].post_date;
                        singleNews.post_link = allNews[i].post_link;
                        singleNews.reaction = allNews[i].reaction;
                        singleNews.sentiment_score = allNews[i].sentiment_score;
                        singleNews.magnitude_score = allNews[i].magnitude_score;
                        singleNews.user_sentiment_score = allNews[i].user_sentiment_score;
                        singleNews.user_magnitude_score = allNews[i].user_magnitude_score;
                        singleNews.post_source = allNews[i].post_source;
                        singleNews.title = allNews[i].title;
                        singleNews.small_title = allNews[i].small_title;
                        singleNews.lead_paragraph = allNews[i].lead_paragraph;
                        singleNews.paragraph = allNews[i].paragraph;
    
                        var clickedId = [];
                        var matchedId = [];
                        for (j = 0; j < allMatched.length; j++) {
                            if (allNews[i].id == allMatched[j].firstArticle) {
                                clickedId.push(allMatched[j].firstArticle);
                                matchedId.push(allMatched[j].secondString);
                            }
                        }
                        if (clickedId.length == 0) {
                            clickedId.push(0);
                            matchedId.push(0);
                        }
                        singleNews.clickedId = clickedId[0];
                        singleNews.matchedId = matchedId[0];
                        finalNewsPackage.push(singleNews);
                    }
                }
                res.json(finalNewsPackage);
            }
            showRelevantNews();
        }
    
        getAllCosine(allNewsStrings);
    }
}

module.exports = {
    showNews
};