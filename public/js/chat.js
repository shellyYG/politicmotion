console.log("generalToken: ", localStorage.getItem("generalToken"));
let buddiesToChat = localStorage.getItem("buddiesToChat");
buddiesToChat = JSON.parse(buddiesToChat);
console.log("buddiesToChat (Front): ", buddiesToChat);

let buddyNames = buddiesToChat.map(element=>element.buddies);
console.log("buddyNames: ", buddyNames);
const chatForm = document.getElementById('chat-form');
const msgPlaceHolder = document.getElementById('messages');
const partnerContainer = document.getElementById('partnerContainer');
const startChatBtn = document.getElementById('startChat');
let selfName;

const socket = io({
    query: {
        generalToken: localStorage.getItem("generalToken"),
        buddyNames: buddyNames
    }
});

socket.on("connect",() => { //default event from socket.io. Have to write "connect" instead of "connection" (but at back-end you need to write "connection")
    console.log("@Front socket.id: ", socket.id);
})
// ======================================================== Not permitted user
socket.on('AuthError', () => {
    alert("Please sign-in to continue.");
    window.location.href="/signIn.html"
})

// ======================================================== Permitted user
// -- get self
socket.on('Self', (self)=>{
    selfName = self
    
});
console.log("selfName: ". selfName);
// --- get who is online
socket.on('OnlineUser', (onlineUsers)=>{
    console.log("online users: ", onlineUsers);

    for (i=0; i<onlineUsers.length; i++){
        if(onlineUsers[i]!==selfName){
            var onlineUserDiv = document.createElement('div');
            onlineUserDiv.setAttribute("id", `buddy_${onlineUsers[i]}`);
            onlineUserDiv.innerHTML = `${onlineUsers[i]}`;
            partnerContainer.appendChild(onlineUserDiv);
        } 
    }
})

var buddyButtons = document.querySelectorAll('[id^="buddy_"]');
for(let i=0; i<buddyButtons.length; i++){
    let buddyButton = buddyButtons[i];
    buddyButton.addEventListener('click',()=>{
        localStorage.setItem('selectedPartner', buddyButton.innerHTML);
    })
}

const clickedUser = localStorage.getItem("selectedPartner");

// --- send chat partner to backend
socket.emit('clickedUser', clickedUser);

chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    // Get message inserted by user
    let msg = e.target.elements.m.value; // m is the id of the input box
    if(!msg){
        return false;
    }
    socket.emit('chatMsg',msg);
})
socket.on('echoChatMsg',(x)=>{
    console.log("echoChatMsg: ", x);
})

// startChatBtn.addEventListener('click',()=>{
//     const clickedUser = localStorage.getItem("selectedPartner");
//     const socket = io({
//         query: {
//             generalToken: localStorage.getItem("generalToken"),
//             buddyNames: buddyNames
//         }
//     });
    
//     socket.on("connect",() => { //default event from socket.io. Have to write "connect" instead of "connection" (but at back-end you need to write "connection")
//         console.log("@Front socket.id: ", socket.id);
//     })
    
//     // ======================================================== Not permitted user
//     socket.on('AuthError', () => {
//         alert("Please sign-in to continue.");
//         window.location.href="/signIn.html"
//     })
    
//     // ======================================================== Permitted user
//     // --- send chat partner to backend
//     socket.emit('clickedUser', clickedUser);

//     chatForm.addEventListener('submit',(e)=>{
//         e.preventDefault();
//         // Get message inserted by user
//         let msg = e.target.elements.m.value; // m is the id of the input box
//         if(!msg){
//             return false;
//         }
//         socket.emit('chatMsg',msg);
//     })
    
//     // socket.on('echoChatMsgFromBack',(msg)=>{
//     //     const div = document.createElement('div');
//     //     div.innerHTML = `<li>${msg}</li>`;
//     //     msgPlaceHolder.appendChild(div);
    
//     //     console.log("@Front - echoChatMsgFromBack: ", msg);
//     // })
    
//     // pm part
//     /////try1
//     socket.on('echoChatMsg',(x)=>{
//         console.log("echoChatMsg: ", x);
//     })

//     // /////try2
//     // socket.on('echoPm',(msg)=>{
//     //     console.log("@Front - echoPmFromBack: ", msg);
//     // })
    
// })


