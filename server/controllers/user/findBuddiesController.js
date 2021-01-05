const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const findBuddiesModel = require('../../models/user/findBuddiesModel');

var firstdegreeBuddies = [];
var firstdegreeBuddiesEmails = [];


const showbuddies =  async (req, res) => {  
    const searchTopic1 = req.body.firstSearchTopic;
    const searchTopic2 = req.body.secondSearchTopic;

    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.log("You are too long away. Please sign in again.");
            res.status(403).send({message: "User does not have permission"});
        }else {
            async function findBuddies(){
                var allUsers = await findBuddiesModel.getAllUsers(searchTopic1, searchTopic2);
                var allEmails = allUsers.map((element)=>{return element.email;});
                var currentUserEmail = payload.data.email;

                // exclude self
                allEmails = allEmails.filter(function(value, index, arr){
                    return value !== currentUserEmail;
                });
                
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

                const filteredSentDistance = [];
                
                // filter to min sentiment distance
                for (i=0; i<similarBuddies.length; i++){
                    //kickout selfs for finding min. 
                    console.log("sentimentMultiples[similarBuddies[i].buddyIndex].matchedEmail: ", sentimentMultiples[similarBuddies[i].buddyIndex].matchedEmail,"sentimentMultiples[buddies[i].buddyIndex].sentimentDistance: ", sentimentMultiples[buddies[i].buddyIndex].sentimentDistance);
                    if(sentimentMultiples[similarBuddies[i].buddyIndex].matchedEmail !== currentUserEmail){ 
                        filteredSentDistance.push(sentimentMultiples[similarBuddies[i].buddyIndex].sentimentDistance);
                    }
                }
                
                var minSentDistance = Math.min.apply(Math, filteredSentDistance.filter(function(x){return x >= 0;}));
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

                // --------------------------------------------------------construct final buddy emails
                let finalBuddyEmails = [];
                // --------------------------------------------------add first-degree email first
                for (i=0; i<firstdegreeBuddies.length; i++){
                    finalBuddyEmails.push(similarBuddies[firstdegreeBuddies[i]].buddyEmail);
                }
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
                var formatbuddyEmails = buddyEmails.map(element=>"\""+element+"\"");
                try{
                    return await findBuddiesModel.getBuddyNameAndSig(formatbuddyEmails);
                }catch(err){
                    return [];
                }
            }

            async function findTopBuddyNames(){
                var buddiesInfo = await findBuddies();
                var topBuddyEmails = buddiesInfo.firstdegreeBuddiesEmails;
                var formatTopBuddyEmails = topBuddyEmails.map(element=>"\""+element+"\"");
                try{
                    return await findBuddiesModel.getTopBuddyNameAndSig(formatTopBuddyEmails);
                }catch(err){
                    return [];
                }
            }

            async function sendBuddyNames(){
                var buddies = await findBuddyNames();
                var topBuddies = await findTopBuddyNames();
                buddyNames = buddies.map(element=>element.username);
                topBuddyNames = topBuddies.map(element=>element.username);
                buddySignatures = buddies.map(element=>element.signature);
                topBuddySignatures = topBuddies.map(element=>element.signature);

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
};

module.exports = {
    showbuddies
};