const { query } = require("../query");
const today = new Date();
let DatePart = today.toLocaleDateString("en-US").split("/");
DatePart = DatePart[2] + "-" + DatePart[0] + "-" + DatePart[1];

async function addNYTNews(allNews){
    sql = "INSERT INTO news_rawdata (news_id, post_link, news_source, published_date, title, abstract, topics, saved_date) VALUES ?";
    let sqlquery = await query(sql, [allNews]);
    return sqlquery;
}

async function getLeadParagraph(){
    sql = `SELECT n.title
    FROM politicmotion.news_rawdata n
    LEFT JOIN politicmotion.nyt_details d ON n.title = d.headline
    WHERE n.news_source = "New York Times" AND d.headline IS NULL
    AND n.saved_date >= '${DatePart}'
    ORDER BY n.id DESC;`;
    let sqlquery = await query(sql);
    return sqlquery;
}

async function addNYTDetails(allDetails){
    sql = "INSERT INTO nyt_details (headline, abstract, lead_paragraph, saved_date) VALUES ?";
    let sqlquery = await query(sql, [allDetails]);
    console.log("done inserting lead-paragraph");
    return sqlquery;

}


module.exports = {
    addNYTNews,
    getLeadParagraph,
    addNYTDetails
};