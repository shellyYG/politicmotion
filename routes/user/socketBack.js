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
        socket.on('joinRoom', ({ username, room }) => {
            const user = userJoin(socket.id, username, room);
            console.log("io.on 3 user",user); //{ id: 'g-ChP6WK0uTkwvtUAAAB', username: 'dd', room: 'Python' }
            socket.join(user.room);
    
        // Welcome current user
        socket.emit('message',formatMessage(botName,'歡迎來跟寂寞的Shelly talk talk')); 
    
        // Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(botName,`${user.username} 來了`)
                );
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        });
    
        // Listen to chatMessage
        socket.on('chatMessage', (msg)=> {
            console.log("4");
            const user = getCurrentUser(socket.id);
            console.log("5", user);
            console.log("user aka getCurrentUser(socket.id)is:", user);
            // Emit the listened message to everybody
            io.to(user.room).emit('message', formatMessage(user.username,msg));
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