console.log("generalToken: ", localStorage.getItem("generalToken"));
let buddiesToChat = localStorage.getItem("buddiesToChat");
buddiesToChat = JSON.parse(buddiesToChat);
console.log("buddiesToChat (Front): ", buddiesToChat);

let buddyNames = buddiesToChat.map(element=>element.buddies);
console.log("buddyNames: ", buddyNames);

const partnerContainer = document.getElementById('partnerContainer');
for (i=0; i<buddyNames.length; i++){
    var partnerDiv = document.createElement('div');
    partnerDiv.innerHTML = `${buddyNames[i]}`;
    partnerContainer.appendChild(partnerDiv);
}


msgPlaceHolder.appendChild(div);


const socket = io({
    query: {
        generalToken: localStorage.getItem("generalToken"),
        buddyNames: buddyNames
    }
});
const chatForm = document.getElementById('chat-form');
const msgPlaceHolder = document.getElementById('messages');



socket.on("connect",() => { //default event from socket.io. Have to write "connect" instead of "connection" (but at back-end you need to write "connection")
    console.log("@Front socket.id: ", socket.id);
})

// Not permitted user
socket.on('AuthError', () => {
    alert("Please sign-in to continue.");
    window.location.href="/signIn.html"
})

// Permitted user
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