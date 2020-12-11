const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io(); //because we have <script src="/socket.io/socket.io.js"></script>
console.log("username is:", username,"room is:", room);

socket.on('message',message=>{ //everytime when we get message, this will run
    outputMessage(message); //add to DOM

    // Scroll down when message increases
    chatMessages.scrollTop = chatMessages.scrollHeight;



    // Join chatroom
    socket.emit('joinRoom', { username , room });

    // Get room and users
    socket.on('roomUsers', ({ room, users }) => {
        outputRoomName(room);
        outputUsers(users);
    });

    // When message submit by the user
    chatForm.addEventListener('submit', (e) => { // (e) means event
        e.preventDefault();

        // Get message inserted by user
        let msg = e.target.elements.msg.value;
        msg = msg.trim(); //remove white space

        if(!msg){
            return false;
        }

        // Emit message to server
        socket.emit('chatMessage', msg);
        console.log("msg front: ", msg)

        // Clear input @input box
        e.target.elements.msg.value = '';
        e.target.elements.msg.focus(); //make the input box in focus view to highlight the box
        outputMessage(msg);
    })

    // output msg to DOM
    function outputMessage(message){
        const div = document.createElement('div');
        div.classList.add('message');
        div.innerHTML = `
        <p class="meta">${message.username}
        <span>${message.time}</span>
        </p>
        <p class="text">
            ${message}
        </p>
        `;
        document.querySelector('.chat-messages').appendChild(div);
    }

   
})


