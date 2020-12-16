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
let senderNow;
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
    senderNow = self.self;
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


// select chat partner //change the element to load historical msg
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

// Load the history
socket.on('history',(data)=>{
    console.log("history : ", data);
    data.forEach(element=>{
        var singleMessage = document.createElement('div');
        singleMessage.setAttribute("class","row container");

        // switch sender & receiver based on if it's self
        if(element.sender == senderNow){ //if its self, add to sender class
            console.log("sender is self")
            var historySender = document.createElement('div');
            historySender.setAttribute("class","sender col-md-2");
            historySender.innerText = "You";
            singleMessage.appendChild(historySender);
            // append time
            var re = /([^T]+)/;
            var pureDatePart = element.message_time.split(re);
            var DatePart = pureDatePart[1].split("-");
            var timeToShow = DatePart[1]+"/"+DatePart[2]+" "+pureDatePart[3].substring(0,5);
            var sendTime = document.createElement('div');
            sendTime.setAttribute("class","sendTime col-md-2");
            sendTime.innerText = timeToShow;
            singleMessage.appendChild(sendTime);

            // append message
            var message = document.createElement('div');
            message.setAttribute("class","message col-md-4");
            message.innerText = element.message;
            singleMessage.appendChild(message);


        }else if(element.receiver == senderNow){ //switch
            console.log("sender is not self")
            // append message
            var message = document.createElement('div');
            message.setAttribute("class","message col-md-4");
            message.innerText = element.message;
            singleMessage.appendChild(message);

            // append time
            var re = /([^T]+)/;
            var pureDatePart = element.message_time.split(re);
            var DatePart = pureDatePart[1].split("-");
            var timeToShow = DatePart[1]+"/"+DatePart[2]+" "+pureDatePart[3].substring(0,5);
            var sendTime = document.createElement('div');
            sendTime.setAttribute("class","sendTime col-md-2");
            sendTime.innerText = timeToShow;
            singleMessage.appendChild(sendTime);

            
            var historySender = document.createElement('div');
            historySender.setAttribute("class","sender col-md-2");
            historySender.innerText = element.sender;
            singleMessage.appendChild(historySender);
        }

        

        msgPlaceHolder.append(singleMessage);

        
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
        sender: senderNow,
        receiver: receiver
    });
})

socket.on('msgToShow',(data)=>{
    console.log("msgToShow" , data);
    var sender = document.createElement('div');
    sender.setAttribute("class","sender");
    sender.innerText = data.sender+":";
    msgPlaceHolder.appendChild(sender);

    var message = document.createElement('div');
    message.setAttribute("class","message");
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
            // clear localStorage chat partner list
        }
    }
    console.log("disconnectUserName: ", disconnectUserName);
    

})