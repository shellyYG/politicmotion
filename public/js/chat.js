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
const selfNameDiv = document.getElementById('selfName');

function unique(value, index, self){
    return self.indexOf(value) === index;
}
buddiesToChat = buddiesToChat.filter(unique);

// put buddies to chat as button on the front-end
for (i=0; i<buddiesToChat.length; i++){
    var singleBuddy = document.createElement('div');
    singleBuddy.setAttribute("class","btn singleBuddy");
    singleBuddy.innerHTML = buddiesToChat[i].buddies;
    partnerContainer.appendChild(singleBuddy);
}

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
// --- get self
socket.on('Self', (self)=>{
    selfNameDiv.innerHTML = self;
});

// --- get who is online
var potentialPartners = document.querySelectorAll('.singleBuddy');
console.log("potentialPartners: ", potentialPartners);
socket.on('OnlineUsers', (onlineUsers)=>{
    console.log("online users: ", onlineUsers);
    for (i=0; i<potentialPartners.length; i++){
        if(onlineUsers.includes(potentialPartners[i].innerHTML)){
            potentialPartners[i].setAttribute("id","onlinePartner");
        }
    }
    var onlinePartners = document.querySelectorAll('#onlinePartner');
    console.log("onlinePartners: ", onlinePartners);
})



// var onlineBuddyButtons = document.querySelectorAll('[id^="online_"]');
// for(let i=0; i<onlineBuddyButtons.length; i++){
//     let onlineBuddyButton = onlineBuddyButtons[i];
//     onlineBuddyButton.addEventListener('click',()=>{
//         localStorage.setItem('selectedPartner', onlineBuddyButton.innerHTML);
//     })
// }
// var offlineBuddyButtons = document.querySelectorAll('[id^="offline_"]');
// for(let i=0; i<offlineBuddyButtons.length; i++){
//     let offlineBuddyButton = offlineBuddyButtons[i];
//     offlineBuddyButton.addEventListener('click',()=>{
//         localStorage.setItem('selectedPartner', offlineBuddyButton.innerHTML);
//     })
// }

const selectedPartner = localStorage.getItem("selectedPartner");

// --- send chat partner to backend
socket.emit('selectedPartner', selectedPartner);

chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    // Get message inserted by user
    let msg = e.target.elements.m.value; // m is the id of the input box
    if(!msg){
        return false;
    }
    socket.emit('chatMsg',msg);
})

io.on('echoChatMsg',(msg)=>{
    console.log("echoChatMsg: ", msg);
})




