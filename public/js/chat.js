var socket = io();
const chatForm = document.getElementById('chat-form');
const msgPlaceHolder = document.getElementById('messages');

socket.on("connect",() => { //default event from socket.io. Have to write "connect" instead of "connection" (but at back-end you need to write "connection")
    console.log("@Front socket.id: ", socket.id);
})



chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    // Get message inserted by user
    let msg = e.target.elements.m.value; // m is the id of the input box
    if(!msg){
        return false;
    }
    socket.emit('chatMsg',msg);
})

socket.on('echoChatMsgFromBack',(msg)=>{
    const div = document.createElement('div');
    div.innerHTML = `<li>${msg}</li>`;
    msgPlaceHolder.appendChild(div);

    console.log("@Front - echoChatMsgFromBack: ", msg);
})

// pm part
socket.on('echoPm',(msg)=>{
    console.log("@Front - echoPmFromBack: ", msg);
})