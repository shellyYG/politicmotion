const { query } = require("../query");
const today = new Date();
let DatePart = today.toLocaleDateString("en-US").split("/");
DatePart = DatePart[2] + "-" + DatePart[0] + "-" + DatePart[1];

async function addNYTNews(allNews){
    sql = "INSERT INTO news_rawdata (news_id, post_link, news_source, published_date, title, abstract, topics, saved_date) VALUES ?";
    let sqlquery = await query(sql, [allNews]);
    return sqlquery;
}

async function dropOldertable(){
    sql = `DROP TABLE IF EXISTS politicmotion.NEWsIdsToDelete;`
    let sqlquery = await query(sql);
    return sqlquery;
}

async function createTmpIdTable(){
    sql = `CREATE TABLE politicmotion.NEWsIdsToDelete AS
    SELECT id
    FROM politicmotion.news_rawdata t
    WHERE t.id > (SELECT MIN(id) FROM politicmotion.news_rawdata WHERE title = t.title);`
    let sqlquery = await query(sql);
    return sqlquery;
}

async function dropDuplicateRecords(){
    sql = `DELETE FROM politicmotion.news_rawdata WHERE id IN (SELECT id FROM politicmotion.NEWsIdsToDelete);`
    let sqlquery = await query(sql);
    return sqlquery;
}

async function dropTmpIdTable(){
    sql = `DROP TABLE IF EXISTS politicmotion.NEWsIdsToDelete;`
    let sqlquery = await query(sql);
    return sqlquery;
}


async function makeNewsTitlleUnique(){
    await dropOldertable;
    await createTmpIdTable;
    await dropDuplicateRecords;
    await dropTmpIdTable;
}


async function updateNewsIdNYT(){
    sql = `UPDATE politicmotion.news_rawdata n 
    SET fb_id = (SELECT id FROM politicmotion.fb_rawdata WHERE title = n.title AND post_source = "nytimes")
    WHERE fb_id IS NULL;`
    let sqlquery = await query(sql);
    return sqlquery;
}

async function getLeadParagraph(){
    sql = `SELECT n.title, n.id
    FROM politicmotion.news_rawdata n
    LEFT JOIN politicmotion.nyt_details d ON n.title = d.headline
    WHERE n.news_source = "New York Times" AND d.headline IS NULL
    AND n.saved_date >= '${DatePart}'
    ORDER BY n.id DESC;`;
    let sqlquery = await query(sql);
    return sqlquery;
}

async function addNYTDetails(allDetails){
    sql = "INSERT INTO nyt_details (headline, abstract, lead_paragraph, saved_date, news_id) VALUES ?";
    let sqlquery = await query(sql, [allDetails]);
    return sqlquery;
}


module.exports = {
    addNYTNews,
    makeNewsTitlleUnique,
    updateNewsIdNYT,
    getLeadParagraph,
    addNYTDetails
};