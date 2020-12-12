const moment = require('moment');
const { formatMessage, userJoin, getCurrentUser, userLeave, getRoomUsers } = require('../../util/messages');

const botName = 'Sexy Admin';

// =================================================================================== End Function Creation
// Run when client connects
let socketCon = function(io){
    // Run when client connects
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