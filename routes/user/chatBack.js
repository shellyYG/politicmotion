const jwt = require('jsonwebtoken');
const { unique } = require('../../models/tfidf');
var userList = {};
var onlineUserList = [];
let eachBuddyName;
let room = "public";
let selfName;
const socketChat = (socket) => {
    console.log("B1");
    let buddyNames;
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
                socket.emit("onlineUsers", onlineUserList); //emit to self
                console.log("B7, onlineUsers: ", onlineUserList);
            }
        })
    });
    socket.on("tokem", (msg) => {
        console.log(msg);
        console.log("B8");
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