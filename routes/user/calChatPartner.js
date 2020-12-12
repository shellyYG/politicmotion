const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { query } = require('../../models/query');

const { unique } = require('../../models/tfidf');

router.post('/', verifyToken, (req, res)=>{
    
    const searchTopic1 = req.body.firstSearchTopic;
    const searchTopic2 = req.body.secondSearchTopic;

    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.log("You are too long away. Please sign in again.");
            res.status(403).send({message: 'User does not have permission'});
        }else {
            async function getAllUsers(){
                sql = `SELECT a.username, a.email, b.firstSearchTopic, b.secondSearchTopic, AVG(b.user_sentiment_score) AS u_sent, AVG(b.user_magnitude_score) AS u_mag
                    FROM politicmotion.user_basic a
                    INNER JOIN politicmotion.user_emotion b ON a.email = b.email
                    WHERE (firstSearchTopic LIKE '%${searchTopic1}%' OR firstSearchTopic LIKE '%${searchTopic2}%') 
                    AND (secondSearchTopic LIKE '%${searchTopic1}%' OR secondSearchTopic LIKE '%${searchTopic2}%')
                    GROUP BY 1,2,3,4
                    ORDER BY u_sent ASC;`
                var sqlquery = await query(sql);
                return sqlquery;
            }
        
            async function findBuddies(){
                var allUsers = await getAllUsers();
                
                var allEmails = allUsers.map((element)=>{return element.email});
                var currentUserEmail = payload.data.email;
                console.log("currentUserEmail: ", currentUserEmail);
                function findEmailArrayIndex(acc,curr, index){
                    // console.log("index: ",index, "curr: ", curr, "currentUserEmail: ", currentUserEmail);
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
                const buddies = [];
                for (i=0; i<sentimentMultiples.length; i++){    
                    if(sentimentMultiples[i].sentimentMultiple > 0){
                        var singleBuddy = {};
                        singleBuddy.buddyIndex = sentimentMultiples[i].secondIndex;
                        singleBuddy.buddyName = sentimentMultiples[i].matchedUserName;
                        singleBuddy.buddyEmail = sentimentMultiples[i].matchedEmail;
                        singleBuddy.sentimentMultiple = sentimentMultiples[i].sentimentMultiple;
                        singleBuddy.sentimentDistance = sentimentMultiples[i].sentimentDistance;
                        singleBuddy.magnitudeDistance = sentimentMultiples[i].magnitudeDistance
                        buddies.push(singleBuddy);
                    }
                }
                console.log("buddies: ", buddies)

                const filteredSentDistance = [];
                
                // filter to min sentiment distance
                for (i=0; i<buddies.length; i++){
                    filteredSentDistance.push(sentimentMultiples[buddies[i].buddyIndex].sentimentDistance);
                }
                
                var minSentDistance = Math.min.apply(Math, filteredSentDistance.filter(function(x){return x > 0})); //avoid finding self

                var smallestSentids = [];
                for (i=0;i<buddies.length;i++){
                    if(buddies[i].sentimentDistance == minSentDistance){
                        smallestSentids.push(i);
                    }
                }

                // in case there are more than one person with same sentiment distances
                var smallestSentBuddies = [];
                for (i=0; i<smallestSentids.length; i++){
                    smallestSentBuddies.push(buddies[smallestSentids[i]]);
                }

                var filteredMagnitudes = smallestSentBuddies.map((element)=>{return element.magnitudeDistance});

                var minMagAmongSmallestSent = Math.min.apply(Math, filteredMagnitudes); //avoid finding self

                var smallestMagids = [];
                for (i=0; i<buddies.length;i++){
                    if(buddies[i].magnitudeDistance == minMagAmongSmallestSent){
                        smallestMagids.push(i);
                    }
                }
                var firstdegreeBuddies = [];
                for (i=0; i< smallestSentids.length; i++){
                    for(j=0; j<smallestMagids.length; j++){
                        if(smallestSentids[i]==smallestMagids[j]){
                            firstdegreeBuddies.push(smallestSentids[i]);
                        }
                        
                    }
                }

                var seconddegreeBuddies = [];
                for (i=0; i< smallestSentids.length; i++){
                    seconddegreeBuddies.push(smallestSentids[i]);
                }
                // --------------------------------------------------------construct final buddy emails
                let finalBuddyEmails = [];
                // --------------------------------------------------add first-degree email first
                for (i=0; i<firstdegreeBuddies.length; i++){
                    finalBuddyEmails.push(buddies[firstdegreeBuddies[i]].buddyEmail);
                }
                // --------------------------------------------------then second-degree email first
                for (i=0; i<seconddegreeBuddies.length; i++){
                    finalBuddyEmails.push(buddies[seconddegreeBuddies[i]].buddyEmail);
                }
                // --------------------------------------------------finally other emails
                for (i=0; i<buddies.length; i++){
                    if(buddies[i].buddyEmail !== currentUserEmail){
                        finalBuddyEmails.push(buddies[i].buddyEmail); //don't add self
                    }
                }

                finalBuddyEmails = finalBuddyEmails.filter(unique);

                console.log("finalBuddyEmails: ", finalBuddyEmails);
            }

            async function findOpposites(){
                var allUsers = await getAllUsers();
                
                var allEmails = allUsers.map((element)=>{return element.email});
                var currentUserEmail = payload.data.email;
                console.log("currentUserEmail: ", currentUserEmail);
                function findEmailArrayIndex(acc,curr, index){
                    // console.log("index: ",index, "curr: ", curr, "currentUserEmail: ", currentUserEmail);
                    if(curr == currentUserEmail){
                        acc = index;
                        return acc;
                    }else{
                        acc=acc;
                        return acc;
                    }
                }

                currentEmailIndex = allEmails.reduce(findEmailArrayIndex,0);
                var sentimentMultiplesOpposite = [];

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
                    sentimentMultiplesOpposite.push(singleSentPack);
                }

                // filter to only those sentiment are at same quadrant
                const Opposites = [];
                for (i=0; i<sentimentMultiplesOpposite.length; i++){    
                    if(sentimentMultiplesOpposite[i].sentimentMultiple < 0){
                        var singleOpposite = {};
                        singleOpposite.oppositeIndex = sentimentMultiplesOpposite[i].secondIndex;
                        singleOpposite.oppositeName = sentimentMultiplesOpposite[i].matchedUserName;
                        singleOpposite.oppositeEmail = sentimentMultiplesOpposite[i].matchedEmail;
                        singleOpposite.sentimentMultiple = sentimentMultiplesOpposite[i].sentimentMultiple;
                        singleOpposite.sentimentDistance = sentimentMultiplesOpposite[i].sentimentDistance;
                        singleOpposite.magnitudeDistance = sentimentMultiplesOpposite[i].magnitudeDistance
                        Opposites.push(singleOpposite);
                    }
                }
                console.log("Opposites: ", Opposites)

                const filteredOppositesSentDistance = [];
                
                // filter to min sentiment distance
                for (i=0; i<Opposites.length; i++){
                    filteredOppositesSentDistance.push(sentimentMultiplesOpposite[Opposites[i].oppositeIndex].sentimentDistance);
                }
                console.log("filteredOppositesSentDistance: ", filteredOppositesSentDistance);
                
                var maxSentDistanceOpposite = Math.max.apply(Math, filteredOppositesSentDistance.filter(function(x){return x > 0})); //avoid finding self
                console.log("maxSentDistanceOpposite: ", maxSentDistanceOpposite);

                var largestSentidsOpposite = [];
                for (i=0;i<Opposites.length;i++){
                    if(Opposites[i].sentimentDistance == maxSentDistanceOpposite){
                        largestSentidsOpposite.push(i);
                    }
                }

                // in case there are more than one person with same sentiment distances
                var largestSentOpposites = [];
                for (i=0; i<largestSentidsOpposite.length; i++){
                    largestSentOpposites.push(Opposites[largestSentidsOpposite[i]]);
                }

                var filteredMagnitudesOpposite = largestSentOpposites.map((element)=>{return element.magnitudeDistance});

                var minMagOpposite = Math.min.apply(Math, filteredMagnitudesOpposite); //avoid finding self
                console.log("minMagOpposite: ", minMagOpposite);

                var smallestMagidsOpposite = [];
                for (i=0; i<Opposites.length;i++){
                    if(Opposites[i].magnitudeDistance == minMagOpposite){
                        smallestMagidsOpposite.push(i);
                    }
                }
                
                var firstdegreeOpposites = [];
                for (i=0; i< largestSentidsOpposite.length; i++){
                    for(j=0; j<smallestMagidsOpposite.length; j++){
                        if(largestSentidsOpposite[i]==smallestMagidsOpposite[j]){
                            firstdegreeOpposites.push(largestSentidsOpposite[i]);
                        }
                        
                    }
                }
                console.log("firstdegreeOpposites: ", firstdegreeOpposites);

                var seconddegreeOpposites = [];
                for (i=0; i< largestSentidsOpposite.length; i++){
                    seconddegreeOpposites.push(largestSentidsOpposite[i]);
                }
                console.log("seconddegreeOpposites: ", seconddegreeOpposites);
                // --------------------------------------------------------construct final Opposites emails
                let finalOppositeEmails = [];
                // --------------------------------------------------add first-degree email first
                for (i=0; i<firstdegreeOpposites.length; i++){
                    finalOppositeEmails.push(Opposites[firstdegreeOpposites[i]].oppositeEmail);
                }
                // --------------------------------------------------then second-degree email first
                for (i=0; i<seconddegreeOpposites.length; i++){
                    finalOppositeEmails.push(Opposites[seconddegreeOpposites[i]].oppositeEmail);
                }
                // --------------------------------------------------finally other emails
                for (i=0; i<Opposites.length; i++){
                    if(Opposites[i].oppositeEmail !== currentUserEmail){
                        finalOppositeEmails.push(Opposites[i].oppositeEmail); //don't add self
                    }
                }

                finalOppositeEmails = finalOppositeEmails.filter(unique);

                console.log("finalOppositeEmails: ", finalOppositeEmails);
            }

            // findBuddies()
            findOpposites()

        }
    })        
})

function verifyToken(req, res, next){
    const bearerHeader=req.headers['authorization'];
    console.log('bearerHeader is: ',bearerHeader);
    
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next()
    }else{
        res.sendStatus(403); //forbidden status
    }
}


module.exports = router;