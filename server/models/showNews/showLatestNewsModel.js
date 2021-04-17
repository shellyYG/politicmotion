const { query } = require("../query");

async function getLatestNews() {
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
    ORDER BY fb.id DESC
    LIMIT 20;`;
    var sqlquery = await query(sql);
    return sqlquery;
}



module.exports = {
    getLatestNews
};