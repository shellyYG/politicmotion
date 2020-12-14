const jwt = require('jsonwebtoken');
const { unique } = require('../../models/tfidf');

var userList = {};
var onlineUserList = [];
let eachBuddyName;

let socketCon = function(io){

    io.on('connection', (socket)=>{
        let token = socket.handshake.query.generalToken;
        let buddyNames = socket.handshake.query.buddyNames;
        
        try{
            eachBuddyName = buddyNames.split(',');
            console.log("eachBuddyName: ", eachBuddyName);
        }catch{
            eachBuddyName = [];
            console.log("eachBuddyName: ", eachBuddyName);
        }
        
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload)=>{
            if (err) {
                console.log("You are too long away. Please sign in again.");
                socket.emit('AuthError', ()=>{
                    console.log("Auth Error!");
                })
            }else{
                // console.log("payload: ", payload, 'a user connected - from @Back');
                console.log('@Back socket.id: ', socket.id);
                
                userList[payload.data.name] = socket; //logged-in

                // console.log("userList: ", userList);

                //emit to front-end who is online
                for (const key in userList) {
                    console.log("key: ", key, "payload.data.name: ", payload.data.name);
                    if(eachBuddyName.includes(key) && key !== payload.data.name){ //only push when it's related users && not self
                    console.log("key is: ", key);    
                    onlineUserList.push(key);
                    }
                }
                console.log("onlineUserList: ", onlineUserList);
                onlineUserList = onlineUserList.filter(unique);
                socket.emit('Self', payload.data.name);
                socket.emit('OnlineUser', onlineUserList);
                
                // socket.on('chatMsg', (x)=>{
                //     console.log("chatMsg received from Front - from @Back: ", x);
                //     io.emit('echoChatMsgFromBack', x);
                // })
            
                // pm part
                /////try1
                socket.on('clickedUser',(clickedUser)=>{
                    console.log("clickedUser: ", clickedUser);
                    var socketAsAUser = userList[clickedUser]; //payload.data.name
                    if(socketAsAUser !== undefined){
                        socket.on('chatMsg', (x)=>{
                            console.log("chatMsg received from Front - from @Back: ", x);
                            socketAsAUser.emit('echoChatMsg',x);
                        })
                        
                    }else{
                        console.log("partner is not online.");
                    }
                    
                })
                

                /////try2
                socket.on('pm', (anotherSocketId, msg)=>{
                    console.log("Inside PM Back");
                    socket.to(anotherSocketId).emit('echoPm', socket.id, msg);
                })
            
                socket.on('disconnect', ()=>{
                    console.log('a user disconnected - from @Back');
                })
            }
        })
        
    })
    

}



module.exports = { socketCon }