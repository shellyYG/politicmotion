const { query } = require("../query");

async function getClickedNews(clickedIds, i, allIdsArrayNum, clickedSources){
    console.log("clickedIds: ", clickedIds, "i: ", i,  "allIdsArrayNum: ", allIdsArrayNum, "clickedSources: ", clickedSources);
    sql = `SELECT id, content, post_date, post_link, reaction, sentiment_score, magnitude_score
                FROM politicmotion.fb_rawdata
                WHERE sentiment_score = ${clickedIds[i].Xaxis} AND magnitude_score = ${clickedIds[i].Yaxis}
                AND id IN (${allIdsArrayNum})
                AND post_source = '${clickedSources[i]}'
                LIMIT 1;`;
    var sqlquery = await query(sql);
    return sqlquery;
}

async function showFirstCLickedNews(clickedIds, i, allIdsArrayNum, allNewsIdClicked, clickedSources) {
    let ClickedNews = await getClickedNews(clickedIds, i, allIdsArrayNum, clickedSources);
    let ClickedNewsId = ClickedNews[0].id;
    allNewsIdClicked.push(ClickedNewsId);
}

async function searchRelevantNews(allIdsArrayNum) {
    sql = `SELECT id, content, post_date, post_link, post_source, reaction,  sentiment_score, magnitude_score 
            FROM fb_rawdata 
            WHERE id IN (${allIdsArrayNum})
            ORDER BY id ASC
            ;`; // here need to change to not limited
    var sqlquery = await query(sql);
    return sqlquery;
}

async function getStopWords() {
    sql = "SELECT words FROM words_stopwords;";
    var sqlquery = await query(sql);
    return sqlquery;
}

async function getRelevantNews(uniqueNewsIdtoShow) {
    sql = `SELECT DISTINCT fb.id, fb.post_link, fb.content, fb.title
    , fb.small_title
    , nyt.lead_paragraph, fox.paragraph
    , fb.post_date, fb.post_link, fb.reaction
    , fb.post_source, fb.sentiment_score, fb.magnitude_score
    , fb.user_sentiment_score, fb.user_magnitude_score
    FROM politicmotion.fb_rawdata fb
    LEFT JOIN politicmotion.news_rawdata big ON fb.title = big.title
    LEFT JOIN politicmotion.nyt_details nyt ON big.title = nyt.headline
    LEFT JOIN politicmotion.fox_details fox ON big.post_link = fox.post_link
    WHERE fb.id IN (${uniqueNewsIdtoShow});`;
    var sqlquery = await query(sql);
    return sqlquery;
}



module.exports = {
    getClickedNews,
    showFirstCLickedNews,
    searchRelevantNews,
    getStopWords,
    getRelevantNews
};