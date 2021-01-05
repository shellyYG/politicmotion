const { query } = require("../query");

async function insertUserEmotion(firstSearchTopic, secondSearchTopic, payload, avgUserSentiment, avgUserMagnitude){
    let insertedData = {
        firstSearchTopic: firstSearchTopic,
        secondSearchTopic: secondSearchTopic,
        username: payload.data.name,
        email: payload.data.email,
        user_sentiment_score: avgUserSentiment.toFixed(2),
        user_magnitude_score: avgUserMagnitude.toFixed(2),
    };
    let sql = "INSERT INTO user_emotion SET ?";
    let sqlquery = await query(sql, insertedData);
    return sqlquery;
}


module.exports = {
    insertUserEmotion
};