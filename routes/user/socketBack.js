const moment = require('moment');

const botName = 'Sexy Admin';
// =================================================================================== Create Functions for use
// ----------------------------------------------------------------------------- Function to format msg
function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format('h:mm a') //hour: minute am Or pm
    }
}

// ----------------------------------------------------------------------------- Functions related to user
const users = [];
// ----------------------------------------------------Join user to chat
function userJoin(id, username, room){
    const user = { id, username, room };
    users.push(user);
    console.log("userJoin func output is: ", user);
    return user;
}

// ----------------------------------------------------Get current user
function getCurrentUser(id) {
    console.log("Inside getCurrentUser: id is", id);
    // console.log("Inside user.id is", user.id); //cant have this line because user does not exist! only in users.find(user-> will user exist as one of the elements of users)
    return users.find(user => user.id === id);
}

// ----------------------------------------------------User leaves chat
function userLeave(id){
    const index = users.findIndex(user => user.id === id);
    if(index !== -1){ 
        return users.splice(index, 1)[0]; //taking out one user
    }
}

// ----------------------------------------------------Get room users
function getRoomUsers(room){
    return users.filter(user => user.room === room);
}

// =================================================================================== End Function Creation
// Run when client connects
let socketCon = function(io){
    io.on('connection', socket => {
        
        socket.emit('message','Welcome to PoliticChat!');
        
    
        // Listen to chatMessage
        socket.on('chatMessage', (msg)=> {
            console.log("msg Backend: ", msg);
        })
    
        // Broadcast when a user disconnects
        socket.on('disconnect',() => {
            const user = userLeave(socket.id);
            if (user) {
                io.to(user.room).emit(
                    'message', 
                    formatMessage(botName,`${user.username}不視好歹離開了`)
                );
            
                // Send users and room info
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }   
        });
        
    });

}



module.exports = { socketCon }