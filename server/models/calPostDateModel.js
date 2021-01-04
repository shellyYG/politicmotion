const { query } = require("./query");

async function getFoxWebData(){
    sql = "SELECT id, published_time, saved_date FROM politicmotion.news_rawdata  WHERE news_source = 'Fox News' AND published_date IS NULL ORDER BY id ASC;";
    var sqlquery = await query(sql);
    return sqlquery;
}
async function getFBData(){
    sql = "SELECT id, post_time FROM politicmotion.fb_rawdata WHERE post_date IS NULL ORDER BY id ASC;";
    var sqlquery = await query(sql);
    return sqlquery;
}

async function updateNewsRawDataDate(finalsqlFormatDate, newsUniqueId){
    sql = `UPDATE news_rawdata SET published_date='${finalsqlFormatDate}' WHERE id=${newsUniqueId}`;
    var sqlquery = await query(sql);
    console.log("DONE Fox-Web published_date id = ", newsUniqueId);
    return sqlquery;
}

async function updateFBRasDataDate(FBfinalsqlFormatDate, FBnewsUniqueId){
    sql = `UPDATE fb_rawdata SET post_date='${FBfinalsqlFormatDate}' WHERE id=${FBnewsUniqueId}`;
    var sqlquery = await query(sql);
    
    console.log("DONE FB post_date id = ", FBnewsUniqueId);
    return sqlquery;

}

module.exports = {
    getFoxWebData,
    getFBData,
    updateNewsRawDataDate,
    updateFBRasDataDate
}