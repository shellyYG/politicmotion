const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true //ignore ampersand
});

const socket = io(); //because we have <script src="/socket.io/socket.io.js"></script>

// Join chatroom
socket.emit('joinRoom', { username , room });

socket.on('ToClient',msgPackage=>{ //everytime when we get message, this will run
    // outputMessage(message); //add to DOM
    console.log("ToClient: ",msgPackage);
    outputMessage(msgPackage);
    
    const msgFromClient = 'happy me!';
    socket.emit('ToServer', {username, msgFromClient});


    // // Scroll down when message increases
    // chatMessages.scrollTop = chatMessages.scrollHeight;

    // // Get room and users
    // socket.on('roomUsers', ({ room, users }) => {
    //     outputRoomName(room);
    //     outputUsers(users);
    // });

    // // When message submit by the user
    // chatForm.addEventListener('submit', (e) => { // (e) means event
    //     e.preventDefault();

    //     // Get message inserted by user
    //     let msg = e.target.elements.msg.value;
    //     msg = msg.trim(); //remove white space

    //     if(!msg){
    //         return false;
    //     }

    //     // Emit message to server
    //     socket.emit('chat msg from client', msg);
    //     console.log("msg front: ", msg)

    //     // Clear input @input box
    //     e.target.elements.msg.value = '';
    //     e.target.elements.msg.focus(); //make the input box in focus view to highlight the box
    //     outputMessage(msg);
    // })

    // output msg to DOM
    function outputMessage(message){
        const div = document.createElement('div');
        div.classList.add('message');
        div.innerHTML = `
        <p class="meta">${message.username}
        <span>${message.time}</span>
        </p>
        <p class="text">
            ${message.text}
        </p>
        `;
        document.querySelector('.chat-messages').appendChild(div);
    }

   
})


