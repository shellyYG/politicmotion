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
                
                userList[payload.data.name] = socket.id; //logged-in

                //emit to front-end who is online
                for (const key in userList) {
                    console.log("payload.data.name: ", payload.data.name);
                    if(eachBuddyName.includes(key) && key !== payload.data.name){ //only push when it's related users && not self   
                    onlineUserList.push(key);
                    }
                }
                console.log("onlineUserList: ", onlineUserList);
                onlineUserList = onlineUserList.filter(unique);

                socket.emit('Self', payload.data.name);
                socket.emit('OnlineUsers', onlineUserList);
                
                socket.on('selectedPartner',(selectedPartner)=>{
                    console.log("selectedPartner: ", selectedPartner);
                    var receiverId = userList[selectedPartner]; //payload.data.name
                    if(receiverId !== undefined){
                        socket.on('chatMsg', (x)=>{
                            console.log("chatMsg received from Front - from @Back: ", x);
                            io.to(receiverId).emit('echoChatMsg',x);
                        })
                        
                    }else{
                        console.log("partner is not online.");
                    }
                    
                })
                
            }
            socket.on('disconnect',()=>{
                console.log('user disconnected');
            })
        })
        
    })
    

}



module.exports = { socketCon }