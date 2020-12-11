const moment = require('moment');
const { formatMessage, userJoin, getCurrentUser, userLeave, getRoomUsers } = require('../../util/messages');

const botName = 'Sexy Admin';

// =================================================================================== End Function Creation
// Run when client connects
let socketCon = function(io){
    io.on('connection', socket => {
        
        console.log("socket.id", socket.id);
        
        socket.on('joinRoom',({ username, room })=>{
            const user = userJoin(socket.id, username, room);
            console.log("user: ", user);
            socket.join(user.room); //join the user
            socket.emit('ToClient', formatMessage(user.username, 'Welcome to PoliticChat!')); //Welcome current user
        })

        socket.on('ToServer', ({ username, room })=>{
            console.log("username: ", username);
            socket.emit('ToClient2', formatMessage(user.username, 'Welcome to PoliticChat!')); 

        })
        // // Listen to chatMessage (input from user) and send it back
        // socket.on('chat msg from client', (msg)=> {
        //     const user = getCurrentUser(socket.id);
        //     console.log("msg Backend: ", msg);
        //     io.to(user.room).emit('chat msg to client', msg); //send msg back to client
        // })
    
        // // Broadcast when a user disconnects
        // socket.on('disconnect',() => {
        //     const user = userLeave(socket.id);
        //     if (user) {
        //         io.to(user.room).emit(
        //             'message', 
        //             formatMessage(botName,`${user.username} left.`)
        //         );
            
        //         // Send users and room info
        //         io.to(user.room).emit('roomUsers', {
        //             room: user.room,
        //             users: getRoomUsers(user.room)
        //         });
        //     }   
        // });
        
    });

}



module.exports = { socketCon }