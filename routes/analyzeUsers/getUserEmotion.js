const express = require('express');
const router = express.Router();


router.post('/',(req, res)=>{
    let userEmotion = req.body.finalEmotionClicked;
    userEmotion = JSON.parse(userEmotion);
    const cleanEmotion = [];
    let avgUserSentiment = 0;
    let avgUserMagnitude = 0;
    for (i=0; i<userEmotion.length; i++){
        cleanEmotion.push(userEmotion[i].split("_")[1]);
        console.log("cleanEmotion: ", cleanEmotion);

        if(cleanEmotion[i] == "loveBtn"){
            avgUserSentiment += 0.9;
            avgUserMagnitude += 0.9;
        }else if(cleanEmotion[i] =="hahaBtn"){
            avgUserSentiment += 0.5;
            avgUserMagnitude += 0.5;
        }else if(cleanEmotion[i] == "cryBtn"){
            avgUserSentiment += -0.6;
            avgUserMagnitude += 0.6;
        }else if(cleanEmotion[i] == "angryBtn"){
            avgUserSentiment += -0.9;
            avgUserMagnitude += 0.9;
        }else{
            avgUserSentiment += 0;
            avgUserMagnitude += 0;
        }
    }
    avgUserSentiment = avgUserSentiment/userEmotion.length;
    avgUserMagnitude = avgUserMagnitude/userEmotion.length;
    combinedUserEmotion = {};
    combinedUserEmotion.avgUserSentiment = avgUserSentiment.toFixed(2);
    combinedUserEmotion.avgUserMagnitude = avgUserMagnitude.toFixed(2);
    res.json(combinedUserEmotion);
})

module.exports = router;