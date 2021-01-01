const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { query } = require("../../models/query");

router.post("/", verifyToken, (req, res)=>{

    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.log("You are too long away. Please sign in again.");
            res.status(403).send({message: "User does not have permission"});
        }else {
            let userEmotion = req.body.finalEmotionClicked;
            userEmotion = JSON.parse(userEmotion);
            
            let avgUserSentiment = 0;
            let avgUserMagnitude = 0;
            
            if (userEmotion == null){
                var combinedUserEmotion = {};
            }else{
                for (i=0; i<userEmotion.length; i++){
                    if(userEmotion[i] == "love"){
                        avgUserSentiment += 0.9;
                        avgUserMagnitude += 0.9;
                    }else if(userEmotion[i] =="haha"){
                        avgUserSentiment += 0.6;
                        avgUserMagnitude += 0.6;
                    }else if(userEmotion[i] == "sad"){
                        avgUserSentiment += -0.6;
                        avgUserMagnitude += 0.6;
                    }else if(userEmotion[i] == "angry"){
                        avgUserSentiment += -0.9;
                        avgUserMagnitude += 0.9;
                    }else{
                        avgUserSentiment += 0;
                        avgUserMagnitude += 0;
                    }
                }

                console.log("avgUserSentiment: ", avgUserSentiment, "avgUserMagnitude", avgUserMagnitude);
                avgUserSentiment = avgUserSentiment/userEmotion.length;
                avgUserMagnitude = avgUserMagnitude/userEmotion.length;
                var combinedUserEmotion = {};
                combinedUserEmotion.avgUserSentiment = avgUserSentiment.toFixed(2);
                combinedUserEmotion.avgUserMagnitude = avgUserMagnitude.toFixed(2);
                
                // insert user emotion to database
                const firstSearchTopic = req.body.firstSearchTopic;
                const secondSearchTopic = req.body.secondSearchTopic;
                async function insertUserEmotion(){
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
                insertUserEmotion();
                console.log("combinedUserEmotion: ", combinedUserEmotion);
            }
            res.json(combinedUserEmotion);
        }
    });
});

function verifyToken(req, res, next){
    const bearerHeader=req.headers["authorization"];
    if(typeof bearerHeader !== "undefined"){
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }else{
        res.sendStatus(403); //forbidden status
    }
}

module.exports = router;