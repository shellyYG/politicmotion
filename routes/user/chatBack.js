user1 = 'Shelly';
user2 = 'Markus';

var socket_list = [];


let socketCon = function(io){

    io.on('connection', (socket)=>{
        console.log('a user connected - from @Back');
        console.log('@Back socket.id: ', socket.id);
        var userPackage = {};
        userPackage.username = user1;
        userPackage.socketId = socket.id;
        socket_list.push(userPackage);
        console.log("socket_list: ", socket_list);
    
        socket.on('chatMsg', (x)=>{
            console.log("chatMsg received from Front - from @Back: ", x);
            io.emit('echoChatMsgFromBack', x);
        })
    
        // pm part
        socket.on('pm', (anotherSocketId, msg)=>{
            socket.to(anotherSocketId).emit('echoPm', socket.id, msg);
        })
    
    
        
    
        socket.on('disconnect', ()=>{
            console.log('a user disconnected - from @Back');
        })
    })

}

module.exports = { socketCon }