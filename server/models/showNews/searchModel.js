const { query } = require("../query");

async function searchFBNYNewsDots(searchTopic1, searchTopic2){
    sql = `SELECT fb.id, fb.sentiment_score, fb.magnitude_score
    FROM politicmotion.fb_rawdata fb
        LEFT JOIN politicmotion.news_rawdata big ON fb.title = big.title
        LEFT JOIN politicmotion.nyt_details nyt ON big.title = nyt.headline
    WHERE fb.post_source = 'nytimes' AND fb.title IS NOT NULL AND fb.title <> 'No Big Title' AND fb.post_date IS NOT NULL AND fb.post_date <> '0000-00-00'
    AND ((fb.content LIKE '%${searchTopic1}%' AND fb.content LIKE '%${searchTopic2}%') 
        OR (fb.title LIKE '%${searchTopic1}%' AND fb.title LIKE '%${searchTopic2}%')
        OR (fb.small_title LIKE '%${searchTopic1}%' AND fb.small_title LIKE '%${searchTopic2}%')
        OR (nyt.lead_paragraph LIKE '%${searchTopic1}%' AND nyt.lead_paragraph LIKE '%${searchTopic2}%')
        OR (fb.content LIKE '%${searchTopic1}%' AND fb.title LIKE '%${searchTopic2}%')
        OR (fb.content LIKE '%${searchTopic1}%' AND fb.small_title LIKE '%${searchTopic2}%')
        OR (fb.content LIKE '%${searchTopic1}%' AND nyt.lead_paragraph LIKE '%${searchTopic2}%')
        OR (fb.title LIKE '%${searchTopic1}%' AND fb.small_title LIKE '%${searchTopic2}%')
        OR (fb.title LIKE '%${searchTopic1}%' AND nyt.lead_paragraph LIKE '%${searchTopic2}%')
        OR (fb.small_title LIKE '%${searchTopic1}%' AND nyt.lead_paragraph LIKE '%${searchTopic2}%')
        OR (fb.title LIKE '%${searchTopic1}%' AND fb.content LIKE '%${searchTopic2}%')
        OR (fb.small_title LIKE '%${searchTopic1}%' AND fb.content LIKE '%${searchTopic2}%')
        OR (nyt.lead_paragraph LIKE '%${searchTopic1}%' AND fb.content LIKE '%${searchTopic2}%')
        OR (fb.small_title LIKE '%${searchTopic1}%' AND fb.title LIKE '%${searchTopic2}%')
        OR (nyt.lead_paragraph LIKE '%${searchTopic1}%' AND fb.title LIKE '%${searchTopic2}%')
        OR (nyt.lead_paragraph LIKE '%${searchTopic1}%' AND fb.small_title LIKE '%${searchTopic2}%')
        )
    ORDER BY fb.id DESC LIMIT 20;`;
    var sqlquery = await query(sql);
    return sqlquery; 
}

async function searchFBFoxNewsDots(searchTopic1, searchTopic2){
    sql = `SELECT fb.id, fb.sentiment_score, fb.magnitude_score
        FROM politicmotion.fb_rawdata fb
            LEFT JOIN politicmotion.news_rawdata big ON fb.title = big.title
            LEFT JOIN politicmotion.fox_details fox ON big.post_link = fox.post_link
        WHERE fb.post_source = 'foxnews' AND fb.title IS NOT NULL AND fb.title <> 'No Big Title' AND fb.post_date IS NOT NULL AND fb.post_date <> '0000-00-00'
                AND ((fb.content LIKE '%${searchTopic1}%' AND fb.content LIKE '%${searchTopic2}%') 
                    OR (fb.title LIKE '%${searchTopic1}%' AND fb.title LIKE '%${searchTopic2}%')
                    OR (fb.small_title LIKE '%${searchTopic1}%' AND fb.small_title LIKE '%${searchTopic2}%')
                    OR (fox.paragraph LIKE '%${searchTopic1}%' AND fox.paragraph LIKE '%${searchTopic2}%')
                    OR (fb.content LIKE '%${searchTopic1}%' AND fb.title LIKE '%${searchTopic2}%')
                    OR (fb.content LIKE '%${searchTopic1}%' AND fb.small_title LIKE '%${searchTopic2}%')
                    OR (fb.content LIKE '%${searchTopic1}%' AND fox.paragraph LIKE '%${searchTopic2}%')
                    OR (fb.title LIKE '%${searchTopic1}%' AND fb.small_title LIKE '%${searchTopic2}%')
                    OR (fb.title LIKE '%${searchTopic1}%' AND fox.paragraph LIKE '%${searchTopic2}%')
                    OR (fb.small_title LIKE '%${searchTopic1}%' AND fox.paragraph LIKE '%${searchTopic2}%')
                    OR (fb.title LIKE '%${searchTopic1}%' AND fb.content LIKE '%${searchTopic2}%')
                    OR (fb.small_title LIKE '%${searchTopic1}%' AND fb.content LIKE '%${searchTopic2}%')
                    OR (fox.paragraph LIKE '%${searchTopic1}%' AND fb.content LIKE '%${searchTopic2}%')
                    OR (fb.small_title LIKE '%${searchTopic1}%' AND fb.title LIKE '%${searchTopic2}%')
                    OR (fox.paragraph LIKE '%${searchTopic1}%' AND fb.title LIKE '%${searchTopic2}%')
                    OR (fox.paragraph LIKE '%${searchTopic1}%' AND fb.small_title LIKE '%${searchTopic2}%')
                    );`;
    var sqlquery = await query(sql);
    return sqlquery; 
}

module.exports = {
    searchFBNYNewsDots,
    searchFBFoxNewsDots
};