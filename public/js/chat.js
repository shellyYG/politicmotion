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

function test(){
    socket.emit('test','test');
}

function unique(value, index, self){
    return self.indexOf(value) === index;
}
buddiesToChat = buddiesToChat.filter(unique);
console.log("buddiesToChat after filter: ", buddiesToChat);

// put buddies to chat as button on the front-end
for (i=0; i<buddiesToChat.length; i++){
    var singleBuddy = document.createElement('div');
    singleBuddy.setAttribute("class","btn singleBuddy");
    singleBuddy.innerHTML = buddiesToChat[i].buddies;
    partnerContainer.appendChild(singleBuddy);
}

const socket = io();

const tokenTest = () =>{
    return new Promise((resolve, reject) =>{
        let query= {
            generalToken: localStorage.getItem("generalToken"),
            buddyNames: buddyNames
        }
        resolve(query)
    })
}

tokenTest().then(result => {
    socket.emit("verifyToken",(result))
})
//1


// socket.on("connect",() => { //default event from socket.io. Have to write "connect" instead of "connection" (but at back-end you need to write "connection")
//     console.log("@Front socket.id: ", socket.id);
// })
// ======================================================== Not permitted user
socket.on('AuthError', () => {
    alert("Please sign-in to continue.");
    window.location.href="/signIn.html"
})

socket.on('test2',(a)=>{
    console.log("test2", a);
})
// ======================================================== Permitted user
// --- get self
socket.on('Self', (self)=>{
    console.log("self", self)
    console.log("selfNameDiv.innerText: ", selfNameDiv.innerText)
    selfNameDiv.innerText = self.self;
    var potentialPartners = document.querySelectorAll('.singleBuddy');
    for (i=0; i<potentialPartners.length; i++){
        console.log(potentialPartners[i].innerHTML, self.onlineUsers)
        if(self.onlineUsers.includes(potentialPartners[i].innerHTML)){
            console.log("set color");
            potentialPartners[i].setAttribute("class","onlinePartner"); //change
        }
    }
    socket.emit('newUserUser', self.self);     
});

socket.on('updateUser', (newUser)=>{
    console.log("updateUser");
    var potentialPartners = document.querySelectorAll('.singleBuddy');
    potentialPartners.forEach(element=>{
        if(element.innerText==newUser){
            console.log("element.innerText", element.innerText);
            element.classList.add('onlinePartner');
        }
    })
})

socket.on("userDisconnected", (msg) => {
    console.log("userDisconnected", msg)
})

// --- get who is online
// var potentialPartners = document.querySelectorAll('.singleBuddy');
// socket.on('OnlineUsers', (onlineUsers)=>{
//     console.log("OnlineUsers happened!");
//     for (i=0; i<potentialPartners.length; i++){
//         console.log(potentialPartners[i].innerHTML, onlineUsers)
//         if(onlineUsers.includes(potentialPartners[i].innerHTML)){
//             console.log("set color");
//             potentialPartners[i].setAttribute("id","onlinePartner"); //change
//         }
//     }
// })

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
// socket.emit('selectedPartner', selectedPartner);

// chatForm.addEventListener('submit',(e)=>{
//     e.preventDefault();
//     // Get message inserted by user
//     let msg = e.target.elements.m.value; // m is the id of the input box
//     if(!msg){
//         return false;
//     }
//     socket.emit('chatMsg',msg);
// })

// socket.on('echoChatMsg',(msg)=>{
//     console.log("echoChatMsg: ", msg);
// })




