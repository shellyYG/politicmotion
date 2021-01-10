const jwt = require("jsonwebtoken");
const { unique } = require("../../../util/tfidf");
const chatModel = require("../../models/user/chatModel");

var userList = {};
var onlineUserList = [];
let room = "public";
let selfName;
let buddyNames;
var receiverId;

const socketChat = async (socket) => {
    socket.emit("getToken");
    socket.on("verifyToken", (query)=>{
        let {generalToken} = query;
        buddyNames = query.buddyNames;
        jwt.verify(generalToken, process.env.ACCESS_TOKEN_SECRET, (err, payload)=>{
            if(err) {
                socket.emit("AuthError", "invalid token");
            }else{
                selfName = payload.data.name;
                userList[payload.data.name] = socket.id;

                socket.join(room);
                socket.emit("Self", { self: payload.data.name, onlineUsers: onlineUserList});
                
                for (const key in userList) {
                    if(buddyNames.includes(key) || key == selfName){ //only push when it's related users (same topic, same positive or negative score)
                        onlineUserList.push(key); //push also self into online user list
                    }
                }
                onlineUserList = onlineUserList.filter(unique);
                socket.to(room).emit("onlineUsers", onlineUserList); //emit to others
                socket.emit("onlineUsers", onlineUserList); //emit to self
            }
        });
    });

    socket.on("allPartnerNames", (partners)=>{
        var partnersFormat = [];
        partners.forEach((p)=>{
            partnersFormat.push("'"+p+"'");
        });
        
        async function sendSignature(){
            var initialSigs = await chatModel.getSignature(partnersFormat);
            var signaturesForShow = [];
            initialSigs.forEach((s)=>{
                signaturesForShow.push(s.signature);
            });
            socket.emit("signaturesForShow", signaturesForShow);
        }
        sendSignature();
    });
    
    socket.on("receiver", (receiver)=>{ //sometimes this won't work

        for (const key in userList){
            if(key == receiver.receiver){ //----------------------------------------- if receiver is online
                receiverId = userList[receiver.receiver]; //receiverId = socketId
            }else{      //----------------------------------------- if receiver is NOT online
                receiverId; // receiverId remains undefined
            }
        }
        
        async function showHistory(){
            let history = await chatModel.searchHistory(receiver);
            socket.emit("history", history); // emit history to self
        }
        showHistory();
        
    });
        
    socket.on("userSendMsg",(data)=>{
        let dateTime = new Date();

        async function saveAndShowMsg(){
            senderId = await chatModel.findSender(data.sender);
            const finalsenderId = senderId[0].id;

            let msgPackage = {};
            msgPackage.sender = data.sender;
            msgPackage.receiver = data.receiver;
            msgPackage.message = data.msg;
            msgPackage.message_time = dateTime;
            msgPackage.sender_id = finalsenderId;
            
            async function showMsg(){
                await chatModel.saveMsg(msgPackage);
                //--------get receiver's socket id
                let receiverSocketId = userList[data.receiver];
                if(!receiverSocketId){
                    //------------if no receiveer, push to self's front-end only
                    socket.emit("msgToShow",{ //emit to self
                        msg: data.msg,
                        sender: data.sender,
                        receiver: data.receiver
                    });
                }else{
                    //------------if yes receiveer, push to self's + receiver's front-end
                    socket.emit("msgToShow",{ //emit to self
                        msg: data.msg,
                        sender: data.sender,
                        receiver: data.receiver
                    });
                    socket.to(receiverSocketId).emit("msgToShow",{ //emit to receiver
                        msg: data.msg,
                        sender: data.sender,
                        receiver: data.receiver
                    });
                }
            }
            showMsg();

        }
        saveAndShowMsg()

        
    });

    // show other topic a user has selected
    socket.on("search topics", (ultimateSelfNamte)=>{
        async function showTopics(){
            var topics = await chatModel.findtopics(ultimateSelfNamte);
            var allTopics = []; //need to be non-global variable so you don't overwrite topics with another user
            topics.forEach((t)=>{
                allTopics.push(t.firstSearchTopic + " & " + t.secondSearchTopic);
            });
            socket.emit("allTopics", allTopics);
        }
        showTopics();
    });

    // get topic clicked
    socket.on("topics clicked",(topics)=>{
        var firstTopic = topics.split("&")[0].trim(); //remove blank
        var secondTopic = topics.split("&")[1].trim();
        async function showOtherPartners(){
            var partnerList = [];
            var signatureList = [];
            var otherPartners = await chatModel.findOtherPartners(firstTopic, secondTopic);
            otherPartners.forEach((partner)=>{
                partnerList.push(partner.username);
                signatureList.push(partner.signature);
            });
            socket.emit("other partners", {
                partnerList: partnerList,
                signatureList: signatureList
            });

            // emit online users again
            socket.to(room).emit("onlineUsers", onlineUserList); //emit to others
            socket.emit("onlineUsers", onlineUserList); //emit to self
        }
        showOtherPartners();
    });

    // disconnect
    socket.on("disconnect", () => {
        onlineUserList = onlineUserList.filter(function(value){
            return value !== selfName;
        });
        socket.emit("userDisconnected", (selfName)); // send to self
        socket.to(room).emit("userDisconnected", (selfName)); // send to all in room except sender
    });
};

module.exports = socketChat;