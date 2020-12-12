const moment = require('moment');
const { formatMessage, userJoin, getCurrentUser, userLeave, getRoomUsers, getAllUsers } = require('../../util/messages');

const botName = 'Sexy Admin';

// =================================================================================== End Function Creation
// Run when client connects
let socketCon = function(io){
    // Run when client connects
    io.on('connection', socket => {
        socket.on('joinRoom', ({ username, room }) => {
            const user = userJoin(socket.id, username, room); //give it email & id from database & room (think about the logic)
            socket.join(user.room);

        // Welcome current user
        socket.emit('message',formatMessage(botName,'Welcome to politic-chat!')); 

        // Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(botName,`${user.username} joins the chat!`)
                );
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });

            // Send all user info
            io.emit('allUsers',{
                users: getAllUsers()
            })
        });

        // Listen to chatMessage
        socket.on('chatMessage', (msg)=> {
            const user = getCurrentUser(socket.id);
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
                    formatMessage(botName,`${user.username} left.`)
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