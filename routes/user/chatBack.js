const jwt = require('jsonwebtoken');
const { unique } = require('../../models/tfidf');
const { query } = require('../../models/query');
// const moment = require('moment');

var userList = {};
var onlineUserList = [];
let room = "public";
let selfName;
let buddyNames;
var receiverId;
const socketChat = (socket) => {
    console.log("B1");
    socket.emit("getToken");
    console.log("B2");
    socket.on('verifyToken', (query)=>{
        console.log("B3");
        let {generalToken} = query;
        buddyNames = query.buddyNames;
        jwt.verify(generalToken, process.env.ACCESS_TOKEN_SECRET, (err, payload)=>{
            if(err) {
                socket.emit("AuthError", "invalid token")
                console.log("B4 invalid, 跳9");
            }else{
                selfName = payload.data.name;
                userList[payload.data.name] = socket.id;
                socket.join(room);
                console.log("B4");
                console.log(`${selfName} join`)
                socket.emit('Self', { self: payload.data.name, onlineUsers: onlineUserList});
                console.log("onlineUserList before pushing from connected users: ", onlineUserList);
                console.log("B5.");
                for (const key in userList) {
                    console.log("key: ", key, "|userList: ", userList, "|buddyNames: ", buddyNames) ;
                    if(buddyNames.includes(key) || key == selfName){ //only push when it's related users (same topic, same positive or negative score)
                        onlineUserList.push(key); //push also self into online user list
                        console.log("B6");
                    }
                }
                onlineUserList = onlineUserList.filter(unique);
                socket.to(room).emit("onlineUsers", onlineUserList); //emit to others
                socket.emit("onlineUsers", onlineUserList); //emit to self the latest online user list
                console.log("B7, onlineUsers: ", onlineUserList);
            }
        })
    });
    
    socket.on("receiver", (receiver)=>{
        
        console.log("received receiver, try to get its socket.id");

        for (const key in userList){
            console.log("key: ", key, "receiver: ", receiver);
            if(key == receiver){ //----------------------------------------- if receiver is online
                console.log("receiver is online");
                receiverId = userList[receiver]; //receiverId = socketId
                
            }else{      //----------------------------------------- if receiver is NOT online
                console.log("receiver is NOT online");
                receiverId; // receiverId remains undefined
            }
        }
        
    })

    console.log("receiverId: ", receiverId); // emit to that socketId
        
    socket.on('userSendMsg',(data)=>{
        console.log("userSendMsg: ", data.msg, "sender: ", data.sender, "receiver: ", data.receiver);
        let dateTime = new Date();
        console.log("dateTime: ", dateTime);
        let msgPackage = {};
        msgPackage.sender = data.sender;
        msgPackage.receiver = data.receiver;
        msgPackage.message = data.msg;
        msgPackage.message_time = dateTime;
        console.log("msgPackage: ", msgPackage);

        async function saveMsg(){
            // save to DB
            sql = 'INSERT INTO chat_history SET ?'
            let sqlquery = await query(sql, msgPackage);
            return sqlquery;
        }
        saveMsg()
    
    })

    socket.on("disconnect", () => {
        console.log("B9");
        console.log("selfName: ", selfName); 
        console.log("disconnected:", "socket.id: ", socket.id, "onlineUserList: ", onlineUserList);
        onlineUserList = onlineUserList.filter(function(value, index, arr){
            return value !== selfName
        })
        console.log("after someone disconnect, remaining online users: ", onlineUserList);
        console.log("B10");
        socket.to(room).emit("userDisconnected", (selfName)); // send to all in room except sender
        console.log("B11");
    })
}

module.exports = socketChat;