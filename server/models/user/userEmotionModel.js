const { query } = require("../query");

async function findUserId(email){
    sql = `SELECT id FROM user_basic WHERE email = '${email}' LIMIT 1;`
    var sqlquery = await query(sql);
    return sqlquery;
}

async function insertUserEmotion(firstSearchTopic, secondSearchTopic, payload, avgUserSentiment, avgUserMagnitude){
    const userId = await findUserId(payload.data.email);
    const finalUserId = userId[0].id;
    console.log("finalUserId: ", finalUserId);
    let insertedData = {
        firstSearchTopic: firstSearchTopic,
        secondSearchTopic: secondSearchTopic,
        username: payload.data.name,
        email: payload.data.email,
        user_sentiment_score: avgUserSentiment.toFixed(2),
        user_magnitude_score: avgUserMagnitude.toFixed(2),
        user_id: finalUserId
    };
    let sql = "INSERT INTO user_emotion SET ?";
    let sqlquery = await query(sql, insertedData);
    return sqlquery;
}


module.exports = {
    insertUserEmotion
};