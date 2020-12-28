const jwt = require('jsonwebtoken');
const { unique } = require('../../models/tfidf');
const { query } = require('../../models/query');


var userList = {};
var onlineUserList = [];
let room = "public";
let selfName;
let buddyNames;
var receiverId;
var allTopics = [];
const socketChat = (socket) => {
    // console.log("B1");
    socket.emit("getToken");
    // console.log("B2");
    socket.on('verifyToken', (query)=>{
        // console.log("B3");
        let {generalToken} = query;
        buddyNames = query.buddyNames;
        jwt.verify(generalToken, process.env.ACCESS_TOKEN_SECRET, (err, payload)=>{
            if(err) {
                socket.emit("AuthError", "invalid token")
                // console.log("B4 invalid, 跳9");
            }else{
                selfName = payload.data.name;
                userList[payload.data.name] = socket.id;
                socket.join(room);
                // console.log("B4");
                console.log(`${selfName} joins`)
                socket.emit('Self', { self: payload.data.name, onlineUsers: onlineUserList});
                // console.log("onlineUserList before pushing from connected users: ", onlineUserList);
                // console.log("B5.");
                for (const key in userList) {
                    console.log("key: ", key, "|userList: ", userList, "|buddyNames: ", buddyNames) ;
                    if(buddyNames.includes(key) || key == selfName){ //only push when it's related users (same topic, same positive or negative score)
                        onlineUserList.push(key); //push also self into online user list
                        // console.log("B6");
                    }
                }
                onlineUserList = onlineUserList.filter(unique);
                socket.to(room).emit("onlineUsers", onlineUserList); //emit to others
                socket.emit("onlineUsers", onlineUserList); //emit to self the latest online user list
                console.log("B7, onlineUsers: ", onlineUserList);
            }
        })
    });

    socket.on('allPartnerNames', (partners)=>{
        console.log("partners: ", partners);
        var partnersFormat = [];
        partners.forEach((p)=>{
            partnersFormat.push("'"+p+"'");
        })
        console.log("partnersFormat", partnersFormat)
        
        async function getSignature(){
            sql = `SELECT username, signature
            FROM politicmotion.user_basic 
            WHERE username IN (${partnersFormat}) 
            ORDER BY FIELD(username,${partnersFormat})`
            var sqlquery = await query(sql);
            return sqlquery;
        }
        async function sendSignature(){
            var initialSigs = await getSignature();
            console.log("initialSigs: ", initialSigs);
            var signaturesForShow = [];
            initialSigs.forEach((s)=>{
                signaturesForShow.push(s.signature);
            })
            console.log("signaturesForShow: ", signaturesForShow);
            socket.emit('signaturesForShow', signaturesForShow);
        }
        sendSignature()
    })
    
    socket.on("receiver", (receiver)=>{ //sometimes this won't work
        // console.log("received receiver");

        for (const key in userList){
            console.log("key: ", key, "receiver.receiver: ", receiver.receiver);
            if(key == receiver.receiver){ //----------------------------------------- if receiver is online
                console.log("receiver is online");
                receiverId = userList[receiver.receiver]; //receiverId = socketId
                
            }else{      //----------------------------------------- if receiver is NOT online
                console.log("receiver is NOT online");
                receiverId; // receiverId remains undefined
            }
        }
        console.log("selfName: ",selfName, "receiver.receiver: ", receiver.receiver);
        // send historical msg to Front-End for later refresh
        async function searchHistory(){
            sql = `SELECT * FROM chat_history 
            WHERE ((sender = '${selfName}' AND receiver = '${receiver.receiver}') 
            OR (sender = '${receiver.receiver}' AND receiver = '${selfName}')) 
            ORDER BY message_time ASC;`
            var sqlquery = await query(sql);
            return sqlquery;
        }
        async function showHistory(){
            let history = await searchHistory();
            // console.log("history: ", history);
            socket.emit('history', history); // emit history to self
        }
        showHistory()
        
    })

    console.log("receiverId: ", receiverId); // emit to that socketId
        
    socket.on('userSendMsg',(data)=>{
        // console.log("userSendMsg: ", data.msg, "sender: ", data.sender, "receiver: ", data.receiver);
        let dateTime = new Date();
        let msgPackage = {};
        msgPackage.sender = data.sender;
        msgPackage.receiver = data.receiver;
        msgPackage.message = data.msg;
        msgPackage.message_time = dateTime;

        console.log("user message: ", data);

        async function saveMsg(){
            // save to DB
            sql = 'INSERT INTO chat_history SET ?'
            let sqlquery = await query(sql, msgPackage);
            return sqlquery;
        }
        saveMsg()

        // emit received msg to selected user's front-end & self's front-end
        //--------get receiver's socket id
        let receiverSocketId = userList[data.receiver];
        console.log('receiver: ', data.receiver, 'receiver socket id: ', receiverSocketId);
        if(!receiverSocketId){
            //------------if no receiveer, push to self's front-end only
            console.log("receiver is not online!");
            socket.emit('msgToShow',{ //emit to self
                msg: data.msg,
                sender: data.sender,
                receiver: data.receiver
            })
        }else{
            //------------if yes receiveer, push to self's + receiver's front-end
            console.log("receiver is online!");
            socket.emit('msgToShow',{ //emit to self
                msg: data.msg,
                sender: data.sender,
                receiver: data.receiver
            })
            socket.to(receiverSocketId).emit('msgToShow',{ //emit to receiver
                msg: data.msg,
                sender: data.sender,
                receiver: data.receiver
            })
        }
    })

    // show other topic a user has selected
    socket.on("search topics", ()=>{
        console.log("reached search topic backend");
        async function findtopics(){
            sql = `SELECT DISTINCT firstSearchTopic, secondSearchTopic
            FROM politicmotion.user_emotion
            WHERE username = '${selfName}';`
            var sqlquery = await query(sql);
            return sqlquery;
        }
        async function showTopics(){
            var topics = await findtopics();
            console.log("topics: ", topics);
            topics.forEach((t)=>{
                allTopics.push(t.firstSearchTopic + " & " + t.secondSearchTopic);
            })
            socket.emit('allTopics', allTopics);
        }
        showTopics();

    })

    // get topic clicked
    socket.on('topics clicked',(topics)=>{
        var firstTopic = topics.split("&")[0].trim(); //remove blank
        var secondTopic = topics.split("&")[1].trim();
        async function findOtherPartners(){
            sql = `SELECT DISTINCT m.username, b.signature 
            FROM politicmotion.user_emotion m
            INNER JOIN politicmotion.user_basic b ON m.username = b.username
            WHERE firstSearchTopic IN ('${firstTopic}', '${secondTopic}')
            AND secondSearchTopic IN ('${firstTopic}', '${secondTopic}')
            `
            var sqlquery = await query(sql);
            return sqlquery;
        }
        async function showOtherPartners(){
            var partnerList = [];
            var signatureList = [];
            var otherPartners = await findOtherPartners();
            otherPartners.forEach((partner)=>{
                partnerList.push(partner.username);
                signatureList.push(partner.signature);
            })
            socket.emit('other partners', {
                partnerList: partnerList,
                signatureList: signatureList
            });
        }
        showOtherPartners()
    })

    // disconnect
    socket.on("disconnect", () => {
        // console.log("B9");
        console.log("selfName: ", selfName); 
        console.log("disconnected:", "socket.id: ", socket.id, "onlineUserList: ", onlineUserList);
        onlineUserList = onlineUserList.filter(function(value, index, arr){
            return value !== selfName
        })

        console.log(`after ${selfName} disconnect, remaining online users: `, onlineUserList);
        console.log("B10");
        socket.emit("userDisconnected", (selfName)); // send to self
        socket.to(room).emit("userDisconnected", (selfName)); // send to all in room except sender
        console.log("B11");
    })
}

module.exports = socketChat;