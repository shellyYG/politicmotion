const { query } = require("../query");

async function getSignature(partnersFormat){
    sql = `SELECT username, signature
    FROM politicmotion.user_basic 
    WHERE username IN (${partnersFormat}) 
    ORDER BY FIELD(username,${partnersFormat})`;
    var sqlquery = await query(sql);
    return sqlquery;
}

async function searchHistory(receiver){
    sql = `SELECT * FROM chat_history 
    WHERE ((sender = '${receiver.senderName}' AND receiver = '${receiver.receiver}') 
    OR (sender = '${receiver.receiver}' AND receiver = '${receiver.senderName}')) 
    ORDER BY message_time ASC;`;
    var sqlquery = await query(sql);
    return sqlquery;
}

async function findSender(sender){
    sql = `SELECT id FROM user_basic WHERE username = '${sender}' LIMIT 1;`
    var sqlquery = await query(sql);
    return sqlquery;
}

async function saveMsg(msgPackage){
    sql = "INSERT INTO chat_history SET ?";
    let sqlquery = await query(sql, msgPackage);
    return sqlquery;
}

async function findtopics(ultimateSelfNamte){
    sql = `SELECT DISTINCT firstSearchTopic, secondSearchTopic
    FROM politicmotion.user_emotion
    WHERE username = '${ultimateSelfNamte}';`;
    var sqlquery = await query(sql);
    return sqlquery;
}

async function findOtherPartners(firstTopic, secondTopic){
    sql = `SELECT DISTINCT m.username, b.signature 
    FROM politicmotion.user_emotion m
    INNER JOIN politicmotion.user_basic b ON m.username = b.username
    WHERE firstSearchTopic IN ('${firstTopic}', '${secondTopic}')
    AND secondSearchTopic IN ('${firstTopic}', '${secondTopic}')
    `;
    var sqlquery = await query(sql);
    return sqlquery;
}


module.exports = {
    getSignature,
    searchHistory,
    findSender,
    saveMsg,
    findtopics,
    findOtherPartners
};