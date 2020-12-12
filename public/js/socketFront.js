const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io(); // we can access this because we have <script src="/socket.io/socket.io.js"></script> @FrontEnd
console.log("username is:", username,"room is:", room);

// Join chatroom
socket.emit('joinRoom', { username , room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// Get message from server
socket.on('message', message => {
    console.log(message);
    // when get message, then output msg to DOM
    outputMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

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

    // Clear input @input box
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus(); //make the input box in focus view to highlight the box
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
        ${message.text}
    </p>
    `;
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;

}

// Add users to DOM
function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}
