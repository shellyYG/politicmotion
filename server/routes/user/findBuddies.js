const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { query } = require("../../models/query");
var firstdegreeBuddies = [];
var firstdegreeBuddiesEmails = [];

router.post("/", verifyToken, (req, res)=>{
    
    const searchTopic1 = req.body.firstSearchTopic;
    const searchTopic2 = req.body.secondSearchTopic;

    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.log("You are too long away. Please sign in again.");
            res.status(403).send({message: "User does not have permission"});
        }else {
            async function getAllUsers(){
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
        
            async function findBuddies(){
                var allUsers = await getAllUsers();
                console.log("allUsers (findBuddies): ", allUsers);
                
                var allEmails = allUsers.map((element)=>{return element.email;});
                var currentUserEmail = payload.data.email;

                // exclude self
                allEmails = allEmails.filter(function(value, index, arr){
                    return value !== currentUserEmail;
                });
                console.log("currentUserEmail: ", currentUserEmail, "allEmails: ", allEmails);
                function findEmailArrayIndex(acc,curr, index){
                    if(curr == currentUserEmail){
                        acc = index;
                        return acc;
                    }else{
                        acc=acc;
                        return acc;
                    }
                }

                currentEmailIndex = allEmails.reduce(findEmailArrayIndex,0);
                var sentimentMultiples = [];
                // console.log("currentEmailIndex: ", currentEmailIndex);

                // get sentiment & magnitude multiple numbers
                for (i=0; i<allUsers.length; i++){
                    var singleSentPack = {};
                    var sentimentMultiple = allUsers[currentEmailIndex].u_sent * allUsers[i].u_sent;
                    var magnitudeMultiple = allUsers[currentEmailIndex].u_mag * allUsers[i].u_mag;
                    var sentimentDistance = Math.abs(allUsers[currentEmailIndex].u_sent - allUsers[i].u_sent);
                    var magnitudeDistance = Math.abs(allUsers[currentEmailIndex].u_mag - allUsers[i].u_mag);
                    
                    singleSentPack.firstIndex = currentEmailIndex;
                    singleSentPack.secondIndex = i;
                    singleSentPack.matchedEmail = allUsers[i].email;
                    singleSentPack.matchedUserName = allUsers[i].username;
                    singleSentPack.sentimentMultiple = sentimentMultiple;
                    singleSentPack.magnitudeMultiple = magnitudeMultiple;
                    singleSentPack.sentimentDistance = sentimentDistance;
                    singleSentPack.magnitudeDistance = magnitudeDistance;
                    sentimentMultiples.push(singleSentPack);
                }

                // filter to only those sentiment are at same quadrant
                const similarBuddies = [];
                for (i=0; i<sentimentMultiples.length; i++){    
                    if(sentimentMultiples[i].sentimentMultiple > 0){
                        var singleBuddy = {};
                        singleBuddy.buddyIndex = sentimentMultiples[i].secondIndex;
                        singleBuddy.buddyName = sentimentMultiples[i].matchedUserName;
                        singleBuddy.buddyEmail = sentimentMultiples[i].matchedEmail;
                        singleBuddy.sentimentMultiple = sentimentMultiples[i].sentimentMultiple;
                        singleBuddy.sentimentDistance = sentimentMultiples[i].sentimentDistance;
                        singleBuddy.magnitudeDistance = sentimentMultiples[i].magnitudeDistance;
                        similarBuddies.push(singleBuddy);
                    }
                }
                console.log("similarBuddies.length: ", similarBuddies.length);
                // get all buddies
                const buddies = [];
                for (i=0; i<sentimentMultiples.length; i++){    
                    var singleBuddy = {};
                    singleBuddy.buddyIndex = sentimentMultiples[i].secondIndex;
                    singleBuddy.buddyName = sentimentMultiples[i].matchedUserName;
                    singleBuddy.buddyEmail = sentimentMultiples[i].matchedEmail;
                    singleBuddy.sentimentMultiple = sentimentMultiples[i].sentimentMultiple;
                    singleBuddy.sentimentDistance = sentimentMultiples[i].sentimentDistance;
                    singleBuddy.magnitudeDistance = sentimentMultiples[i].magnitudeDistance;
                    buddies.push(singleBuddy);
                }

                console.log("buddies.length: ", buddies.length);

                const filteredSentDistance = [];
                // console.log("sentimentMultiples: ", sentimentMultiples);
                // filter to min sentiment distance
                for (i=0; i<similarBuddies.length; i++){
                    //kickout selfs for finding min. 
                    console.log("sentimentMultiples[similarBuddies[i].buddyIndex].matchedEmail: ", sentimentMultiples[similarBuddies[i].buddyIndex].matchedEmail,"sentimentMultiples[buddies[i].buddyIndex].sentimentDistance: ", sentimentMultiples[buddies[i].buddyIndex].sentimentDistance);
                    if(sentimentMultiples[similarBuddies[i].buddyIndex].matchedEmail !== currentUserEmail){ 
                        filteredSentDistance.push(sentimentMultiples[similarBuddies[i].buddyIndex].sentimentDistance);
                    }
                }
                console.log("filteredSentDistance: ", filteredSentDistance);
                var minSentDistance = Math.min.apply(Math, filteredSentDistance.filter(function(x){return x >= 0;})); 
                console.log("minSentDistance: ", minSentDistance);
                var smallestSentids = [];
                for (i=0;i<similarBuddies.length;i++){
                    if(similarBuddies[i].sentimentDistance == minSentDistance){
                        smallestSentids.push(i);
                    }
                }

                // in case there are more than one person with same sentiment distances
                var smallestSentBuddies = [];
                for (i=0; i<smallestSentids.length; i++){
                    smallestSentBuddies.push(similarBuddies[smallestSentids[i]]);
                }

                var filteredMagnitudes = smallestSentBuddies.map((element)=>{return element.magnitudeDistance;});

                var minMagAmongSmallestSent = Math.min.apply(Math, filteredMagnitudes); //avoid finding self. but can't avoid if there is a zero

                var smallestMagids = [];
                for (i=0; i<similarBuddies.length;i++){
                    if(similarBuddies[i].magnitudeDistance == minMagAmongSmallestSent){
                        smallestMagids.push(i);
                    }
                }
                
                for (i=0; i< smallestSentids.length; i++){
                    for(j=0; j<smallestMagids.length; j++){
                        if(smallestSentids[i]==smallestMagids[j] && similarBuddies[smallestSentids[i]].buddyEmail !==currentUserEmail){
                            firstdegreeBuddies.push(smallestSentids[i]);
                            firstdegreeBuddiesEmails.push(similarBuddies[smallestSentids[i]].buddyEmail);
                        }
                        
                    }
                }
                console.log("firstdegreeBuddiesEmails: ", firstdegreeBuddiesEmails);

                // --------------------------------------------------------construct final buddy emails
                let finalBuddyEmails = [];
                // --------------------------------------------------add first-degree email first
                for (i=0; i<firstdegreeBuddies.length; i++){
                    finalBuddyEmails.push(similarBuddies[firstdegreeBuddies[i]].buddyEmail);
                }
                console.log("firstdegreeBuddiesEmails: ", firstdegreeBuddiesEmails);
                // --------------------------------------------------finally other emails
                for (i=0; i<buddies.length; i++){
                    if(buddies[i].buddyEmail !== currentUserEmail && 
                    !firstdegreeBuddiesEmails.includes(buddies[i].buddyEmail)){
                        finalBuddyEmails.push(buddies[i].buddyEmail); //don't add self
                    }
                }
                return {finalBuddyEmails, firstdegreeBuddiesEmails};
            }

            async function findBuddyNames(){
                var buddiesInfo = await findBuddies();
                var buddyEmails = buddiesInfo.finalBuddyEmails;
                console.log("buddyEmails: ", buddyEmails);
                var formatbuddyEmails = buddyEmails.map(element=>"\""+element+"\"");
                console.log("formatbuddyEmails: ", formatbuddyEmails);
                
                try{
                    sql = `SELECT username, signature FROM politicmotion.user_basic WHERE email IN (${formatbuddyEmails})
                        ORDER BY Field(email,${formatbuddyEmails});`; // ASC so it will already rank by distance
                    var sqlquery = await query(sql);
                    return sqlquery;
                }catch(err){
                    return [];
                }
            }

            async function findTopBuddyNames(){
                var buddiesInfo = await findBuddies();
                var topBuddyEmails = buddiesInfo.firstdegreeBuddiesEmails;
                console.log("topBuddyEmails: ", topBuddyEmails);
                var formatTopBuddyEmails = topBuddyEmails.map(element=>"\""+element+"\"");
                console.log("formatTopBuddyEmails: ", formatTopBuddyEmails);
                try{
                    sql = `SELECT username, signature FROM politicmotion.user_basic WHERE email IN (${formatTopBuddyEmails})
                        ORDER BY Field(email,${formatTopBuddyEmails});`; // ASC so it will already rank by distance
                    var sqlquery = await query(sql);
                    return sqlquery;
                }catch(err){
                    return [];
                }
                
            }

            async function sendBuddyNames(){
                var buddies = await findBuddyNames();
                var topBuddies = await findTopBuddyNames();
                console.log("buddies: ", buddies);
                console.log("topBuddies: ", topBuddies);
                buddyNames = buddies.map(element=>element.username);
                topBuddyNames = topBuddies.map(element=>element.username);
                buddySignatures = buddies.map(element=>element.signature);
                topBuddySignatures = topBuddies.map(element=>element.signature);

                console.log("buddyNames: ", buddyNames,"buddySignatures: ", buddySignatures, "topBuddySignatures: ", topBuddySignatures);
                res.send({
                    buddyNames: buddyNames, 
                    topBuddyNames: topBuddyNames,
                    buddySignatures: buddySignatures,
                    topBuddySignatures: topBuddySignatures
                });
            }
            sendBuddyNames();     
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