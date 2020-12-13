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
                sql = `SELECT a.username, a.email, AVG(b.user_sentiment_score) AS u_sent, AVG(b.user_magnitude_score) AS u_mag
                    FROM politicmotion.user_basic a
                    INNER JOIN politicmotion.user_emotion b ON a.email = b.email
                    WHERE (firstSearchTopic LIKE '%${searchTopic1}%' OR firstSearchTopic LIKE '%${searchTopic2}%') 
                    AND (secondSearchTopic LIKE '%${searchTopic1}%' OR secondSearchTopic LIKE '%${searchTopic2}%')
                    GROUP BY 1,2
                    ORDER BY u_sent DESC;` // DESC so it will already rank by distance
                var sqlquery = await query(sql);
                return sqlquery;
            }
        
            async function findOpposites(){
                var allUsers = await getAllUsers();
                console.log("allUsers (Opposites): ", allUsers);
                
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
                var firstdegreeOppositesEmails = [];
                for (i=0; i< largestSentidsOpposite.length; i++){
                    for(j=0; j<smallestMagidsOpposite.length; j++){
                        if(largestSentidsOpposite[i]==smallestMagidsOpposite[j]){
                            firstdegreeOpposites.push(largestSentidsOpposite[i]);
                            firstdegreeOppositesEmails.push(Opposites[largestSentidsOpposite[i]].oppositeEmail);
                        }
                        
                    }
                }
                console.log("firstdegreeOpposites" , firstdegreeOpposites, "firstdegreeOppositesEmails: ", firstdegreeOppositesEmails);

                var seconddegreeOpposites = [];
                var seconddegreeOppositesEmails = [];

                for (i=0; i< largestSentidsOpposite.length; i++){
                    if(!firstdegreeOpposites.includes(largestSentidsOpposite[i])){
                        seconddegreeOpposites.push(largestSentidsOpposite[i]);
                        seconddegreeOppositesEmails.push(Opposites[largestSentidsOpposite[i]].oppositeEmail);
                    }
                    
                }
                console.log("seconddegreeOppositesEmails: ", seconddegreeOppositesEmails);
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
                    if(Opposites[i].oppositeEmail !== currentUserEmail &&
                        !firstdegreeOppositesEmails.includes(Opposites[i].oppositeEmail) &&
                        !seconddegreeOppositesEmails.includes(Opposites[i].oppositeEmail)){
                        finalOppositeEmails.push(Opposites[i].oppositeEmail); //don't add self
                    }
                }

                return finalOppositeEmails;
            }
            async function findOppositeNames(){
                var oppositeEmails = await findOpposites();
                var formatoppositeEmails = oppositeEmails.map(element=>'"'+element+'"');
                console.log("formatoppositeEmails: ", formatoppositeEmails);
                sql = `SELECT username FROM politicmotion.user_basic WHERE email IN (${formatoppositeEmails})
                        ORDER BY Field(email,${formatoppositeEmails});` // ASC so it will already rank by distance
                var sqlquery = await query(sql);
                return sqlquery;
            }

            async function sendOppositeNames(){
                var oppositeNames = await findOppositeNames();
                oppositeNames = oppositeNames.map(element=>element.username);
                console.log("oppositeNames: ", oppositeNames);
                res.send(oppositeNames);
            }
            sendOppositeNames();
            
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