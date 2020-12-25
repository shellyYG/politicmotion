// const socket = io();
// const messageForm = document.getElementById('send-container');
// const messageInput = document.getElementById('message-input');
// const chatForm = document.getElementById('chat-form');
// const chatMessages = document.querySelector('.chat-messages');
// const roomName = document.getElementById('room-name');
// const roomUserList = document.getElementById('room-users');
// const allUserList = document.getElementById('all-users');


// // Get username and room from URL
// const { username, room } = Qs.parse(location.search, {
//     ignoreQueryPrefix: true
// });


// let buddies = localStorage.getItem("buddiesToChat");
// buddies = JSON.parse(buddies);
// console.log("buddies: ", buddies);

// // Join chatroom
// socket.emit('joinRoom', { username , room });

// // Get room and users
// socket.on('roomUsers', ({ room, users }) => {
//     outputRoomName(room);
//     outputRoomUsers(users);
//     console.log("users: ", users);
// });

// // Get room and users
// socket.on('allUsers', ({ users }) => {
//     outputAllUsers(users);
// });

// // Get message from server
// socket.on('message', message => {
//     console.log(message);
//     // when get message, then output msg to DOM
//     outputMessage(message);

//     // Scroll down
//     chatMessages.scrollTop = chatMessages.scrollHeight;
// })

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
//     socket.emit('chatMessage', msg);

//     // // Emit to Markus only
//     // io.to("gagRckumZLIxzfdlAAAJ").emit('ToMarkus',"loveyou");

//     // Clear input @input box
//     e.target.elements.msg.value = '';
//     e.target.elements.msg.focus(); //make the input box in focus view to highlight the box
// })

// // output msg to DOM
// function outputMessage(message){
//     const div = document.createElement('div');
//     div.classList.add('message');
//     div.innerHTML = `
//     <p class="meta">${message.username}
//     <span>${message.time}</span>
//     </p>
//     <p class="text">
//         ${message.text}
//     </p>
//     `;
//     document.querySelector('.chat-messages').appendChild(div);
// }

// // Add room name to DOM
// function outputRoomName(room){
//     roomName.innerText = room;

// }

// // Add room users to DOM
// function outputRoomUsers(users){
//     roomUserList.innerHTML = `
//         ${users.map(user => `<li>${user.username} / id: ${user.id} / room: ${user.room}</li>`).join('')}
//     `
// }

// // Add all users to DOM
// function outputAllUsers(users){
//     allUserList.innerHTML = `
//         ${users.map(user => `<li>${user.username} / id: ${user.id} / room: ${user.room}</li>`).join('')}
//     `
// }
