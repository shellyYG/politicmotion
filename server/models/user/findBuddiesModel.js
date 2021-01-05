const { query } = require("../query");

async function getAllUsers(searchTopic1, searchTopic2){
    sql = `SELECT a.username, a.email, AVG(b.user_sentiment_score) AS u_sent, AVG(b.user_magnitude_score) AS u_mag
        FROM politicmotion.user_basic a
        INNER JOIN politicmotion.user_emotion b ON a.email = b.email
        WHERE (firstSearchTopic = '${searchTopic1}' OR firstSearchTopic = '${searchTopic2}') 
        AND (secondSearchTopic = '${searchTopic1}' OR secondSearchTopic = '${searchTopic2}')
        GROUP BY 1,2
        ORDER BY u_sent ASC;`; // ASC so it will already rank by distance
    var sqlquery = await query(sql);
    return sqlquery;
}

async function getBuddyNameAndSig(formatbuddyEmails){
    sql = `SELECT username, signature FROM politicmotion.user_basic WHERE email IN (${formatbuddyEmails})
            ORDER BY Field(email,${formatbuddyEmails});`; 
    var sqlquery = await query(sql);
    return sqlquery;
}

async function getTopBuddyNameAndSig(formatTopBuddyEmails){
    sql = `SELECT username, signature FROM politicmotion.user_basic WHERE email IN (${formatTopBuddyEmails})
            ORDER BY Field(email,${formatTopBuddyEmails});`; 
    var sqlquery = await query(sql);
    return sqlquery;
}

module.exports = {
    getAllUsers,
    getBuddyNameAndSig,
    getTopBuddyNameAndSig
}