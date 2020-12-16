const socket = io();
let buddiesToChat = localStorage.getItem("buddiesToChat");
buddiesToChat = JSON.parse(buddiesToChat);
let buddyNames = buddiesToChat.map(element=>element.buddies);
const chatForm = document.getElementById('chat-form');
const msgPlaceHolder = document.getElementById('messages');
const partnerContainer = document.getElementById('partnerContainer');
const startChatBtn = document.getElementById('startChat');
const selfNameDiv = document.getElementById('selfName');
const sendMsgBtn = document.getElementById('sendMsgBtn');
let sender;
let receiver;

function unique(value, index, self){
    return self.indexOf(value) === index;
}
buddiesToChat = buddiesToChat.filter(unique);
for (i=0; i<buddiesToChat.length; i++){
    var singleBuddy = document.createElement('div');
    singleBuddy.setAttribute("class","btn singleBuddy");
    singleBuddy.innerHTML = buddiesToChat[i].buddies;
    partnerContainer.appendChild(singleBuddy);
}
const tokenTest = () =>{
    return new Promise((resolve, reject) =>{
        let query= {
            generalToken: localStorage.getItem("generalToken"),
            buddyNames: buddyNames
        }
        resolve(query)
    })
}
console.log("F1");
socket.on("getToken", () => {
    console.log("F2");
    tokenTest().then(result => {
        console.log(`${result.generalToken} connected.`)
        socket.emit("verifyToken",(result))
        console.log("F3");
    })
});
socket.on("AuthError", (msg) => {
    console.log(msg);
    alert("Please sign in again.")
    window.location.replace("/signIn.html")
    console.log("F4 Auth Error");
});

socket.on('Self', (self)=>{
    console.log("F4");
    sender = self.self;
    selfNameDiv.innerText = self.self;
    socket.emit('newUserUser');
    console.log("F5");
});
socket.on("onlineUsers", (onlineUserList) => {
    console.log("F6");
    var potentialPartners = document.querySelectorAll('.singleBuddy');
    console.log("onlineUsers: ", onlineUserList);
    for (i=0; i<potentialPartners.length; i++){
        if(onlineUserList.includes(potentialPartners[i].innerHTML)){
            console.log("set color");
            potentialPartners[i].setAttribute("id","onlinePartner"); //change
        }
    }
    console.log("F7");
});


// select chat partner
var potentialPartners = document.querySelectorAll('.singleBuddy');
console.log("potentialPartners: ", potentialPartners);
potentialPartners.forEach(element=>{
    element.addEventListener('click',()=>{
        localStorage.setItem('receiver', element.innerText);
        receiver = localStorage.getItem("receiver");
        console.log("receiver: ",receiver);
        socket.emit('receiver', receiver); //send to all server
        console.log("receiver sent to back-end!");
    })
    
})

// start chatting to selected chat partner
// When message submit by the user
chatForm.addEventListener('submit', (e) => { // (e) means event
    e.preventDefault();

    // Get message inserted by user
    let msg = e.target.elements.userMsg.value;
    msg = msg.trim(); //remove white space

    console.log("msg: ", msg);

    if(!msg){
        return false;
    }
    socket.emit('userSendMsg',{
        msg: msg,
        sender: sender,
        receiver: receiver
    });
})

socket.on('msgToShow',(data)=>{
    console.log("msgToShow" , data);
    var sender = document.createElement('div');
    sender.setAttribute("class","sender");
    sender.innerText = data.sender;
    msgPlaceHolder.appendChild(sender);

    var message = document.createElement('div');
    message.setAttribute("class","sender");
    message.innerText = data.msg;
    msgPlaceHolder.appendChild(message);

})


socket.on("userDisconnected", (disconnectUserName) => {
    console.log("F8");
    var potentialPartners = document.querySelectorAll('.singleBuddy');
    for (i=0; i<potentialPartners.length; i++){
        if(potentialPartners[i].innerHTML == disconnectUserName){
            console.log("remove color");
            potentialPartners[i].removeAttribute("id"); //remove color
        }
    }
    console.log("disconnectUserName: ", disconnectUserName);
    

})