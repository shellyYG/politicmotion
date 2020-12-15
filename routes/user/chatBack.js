const jwt = require('jsonwebtoken');
const { unique } = require('../../models/tfidf');

var userList = {};
var onlineUserList = [];

let eachBuddyName;
let room = "public"

const socketChat = (socket)=>{
    socket.on('verifyToken', (query)=>{
        let token = query.generalToken;
        let buddyNames = query.buddyNames;
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload)=>{
            if (err) {
                console.log("You are too long away. Please sign in again.");
                socket.emit('AuthError', ()=>{
                    console.log("Auth Error!");
                })
            }else{
                userList[payload.data.name] = socket.id; //logged-in
                console.log("userList1: ", userList);

                //emit to front-end who is online
                for (const key in userList) {
                    console.log("buddyNames: ", buddyNames, "key: ", key);
                    if(buddyNames.includes(key)){ //only push when it's related users   
                        onlineUserList.push(key);
                    }
                }
                console.log("onlineUserList: ", onlineUserList);
                onlineUserList = onlineUserList.filter(unique);
                socket.emit('Self', { self: payload.data.name, onlineUsers: onlineUserList});

            }
        })

    })
    socket.on('newUserUser',(newUser)=>{
        console.log("newUser get in");
        socket.emit('updateUser',newUser);
    })

    socket.on('test',(a)=>{
        console.log("a: ", a);
        socket.emit('test2', 'test2');
    })

    socket.on('disconnect',()=>{
        console.log('user disconnected');
        socket.emit("userDisconnected", "userleave");
        // socket.to(room).emit("userDisconnected", "userleave");
    })
    // let token = socket.handshake.query.generalToken;
    // let buddyNames = socket.handshake.query.buddyNames;
    
    
    
    // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload)=>{
    //     if (err) {
    //         console.log("You are too long away. Please sign in again.");
    //         socket.emit('AuthError', ()=>{
    //             console.log("Auth Error!");
    //         })
    //     }else{
            
    //         userList[payload.data.name] = socket.id; //logged-in

    //         //nick
    //         socket.emit('newuser', userList);
    //         //emit to front-end who is online
    //         for (const key in userList) {
    //             console.log("payload.data.name: ", payload.data.name);
    //             if(eachBuddyName.includes(key) && key !== payload.data.name){ //only push when it's related users && not self   
    //             onlineUserList.push(key);
    //             }
    //         }
            
    //         onlineUserList = onlineUserList.filter(unique);

    //         socket.emit('Self', payload.data.name);
            
    //         socket.emit('OnlineUsers', onlineUserList);
            
    //         socket.on('selectedPartner',(selectedPartner)=>{
    //             console.log("selectedPartner: ", selectedPartner);
    //             var receiverId = userList[selectedPartner]; //payload.data.name
    //             if(receiverId !== undefined){
    //                 socket.on('chatMsg', (x)=>{
    //                     console.log("chatMsg received from Front - from @Back: ", x);
    //                     io.to(receiverId).emit('echoChatMsg',x);
    //                 })
                    
    //             }else{
    //                 console.log("partner is not online.");
    //             }
                
    //         })
            
    //     }
    //     socket.on('disconnect',()=>{
    //         console.log('user disconnected');
    //     })
    // })
    
}

module.exports = socketChat;