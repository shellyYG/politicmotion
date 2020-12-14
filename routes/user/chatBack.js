const jwt = require('jsonwebtoken');

var userList = {};

let socketCon = function(io){

    io.on('connection', (socket)=>{
        let token = socket.handshake.query.generalToken;
        let buddyNames = socket.handshake.query.buddyNames;
        console.log("buddyNames (Back): ", buddyNames);
        console.log("type of(buddyNames)", typeof(buddyNames));
        try{
            let eachBuddyName = buddyNames.split(',');
            console.log("eachBuddyName: ", eachBuddyName);
        }catch{
            let eachBuddyName = [];
            console.log("eachBuddyName: ", eachBuddyName);
        }
        
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload)=>{
            if (err) {
                console.log("You are too long away. Please sign in again.");
                socket.emit('AuthError', ()=>{
                    console.log("Auth Error!");
                })
            }else{
                console.log("payload: ", payload);
                console.log('a user connected - from @Back');
                console.log('@Back socket.id: ', socket.id);
                var userPackage = {};
                userPackage.username = payload.data.name;
                userPackage.socketId = socket.id;
                
                userList[payload.data.name] = socket;

                // console.log("userList (IN): ", userList);
            
                socket.on('chatMsg', (x)=>{
                    console.log("chatMsg received from Front - from @Back: ", x);
                    io.emit('echoChatMsgFromBack', x);
                })
            
                // pm part
                /////try1
                var socketAsAUser = userList[payload.data.name];
                socketAsAUser.emit('sth','sth');

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