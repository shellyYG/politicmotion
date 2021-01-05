const jwt = require("jsonwebtoken");
const userEmotionModel = require("../../models/user/userEmotionModel");

const getUserEmotion = async (req, res) => {
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
                
                userEmotionModel.insertUserEmotion(firstSearchTopic, secondSearchTopic, payload, avgUserSentiment, avgUserMagnitude);
                console.log("combinedUserEmotion: ", combinedUserEmotion);
            }
            res.json(combinedUserEmotion);
        }
    });
};


module.exports = {
    getUserEmotion
};