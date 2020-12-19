const socket = io();

let buddiesToChat = localStorage.getItem("buddiesToChat");
buddiesToChat = JSON.parse(buddiesToChat);
let buddyNames = buddiesToChat.map(element=>element.buddies);
const chatForm = document.getElementById('chat-form');
const submitBtn = document.getElementById('sendMsgBtn');
const msgPlaceHolder = document.getElementById('chatList');
const partnerContainer = document.getElementById('friend-list');
const startChatBtn = document.getElementById('startChat');
const sendMsgBtn = document.getElementById('sendMsgBtn');
let senderNow;
let receiver;
let selfNameDiv = document.getElementById('selfName');

const chatList = document.getElementById('chatList');

function unique(value, index, self){
    return self.indexOf(value) === index;
}

buddiesToChat = buddiesToChat.filter(unique);
for (i=0; i<buddiesToChat.length; i++){
    var singleBuddy = document.createElement('li');
    singleBuddy.setAttribute("class","clearfix singleBuddy");
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
    // empty history with other people
    msgPlaceHolder.innerHTML = "";

    // add history with others
    data.forEach(element=>{
        var singleMessage = document.createElement('li');

        // switch sender & receiver based on if it's self
        if(element.sender == senderNow){ //if its self, add to sender class
            console.log("sender is self");
            singleMessage.setAttribute("class","right clearfix");
            // append sender (self)
            var historySender = document.createElement('span');
            historySender.setAttribute("class","sender chat-img pull-right");
            historySender.innerText = "You";
            singleMessage.appendChild(historySender);

            // ------ append clearfix for time & message
            var timeContentDiv = document.createElement('div');
            timeContentDiv.setAttribute('class','chat-body clearfix');
            singleMessage.appendChild(timeContentDiv);

            // append time
            var re = /([^T]+)/;
            var pureDatePart = element.message_time.split(re);
            var DatePart = pureDatePart[1].split("-");
            var lastDatePart = DatePart[2];
            var timePart = lastDatePart.split(" ")[1];
            var timingPart = timePart.split(":")[0]+":"+timePart.split(":")[1];
            var timeToShow = DatePart[1]+"/"+lastDatePart.split(" ")[0]+" "+timingPart;
            
            var sendTime = document.createElement('div');
            sendTime.setAttribute("class","sendTime header");
            sendTime.innerText = timeToShow;
            timeContentDiv.appendChild(sendTime);

            // append message
            var message = document.createElement('p');
            // message.setAttribute("class","message col-md-8");
            message.innerText = element.message;
            timeContentDiv.appendChild(message);

        }else if(element.receiver == senderNow){ //switch
            console.log("sender is not self");
            singleMessage.setAttribute("class","left clearfix");
            // append sender (other people)
            var historySender = document.createElement('span');
            historySender.setAttribute("class","sender chat-img pull-left");
            historySender.innerText = element.sender;
            singleMessage.appendChild(historySender);

            // ------ append clearfix for time & message
            var timeContentDiv = document.createElement('div');
            timeContentDiv.setAttribute('class','chat-body clearfix');
            singleMessage.appendChild(timeContentDiv);
            
            // append time
            var re = /([^T]+)/;
            var pureDatePart = element.message_time.split(re);
            var DatePart = pureDatePart[1].split("-");
            var lastDatePart = DatePart[2];
            var timePart = lastDatePart.split(" ")[1];
            var timingPart = timePart.split(":")[0]+":"+timePart.split(":")[1];
            var timeToShow = DatePart[1]+"/"+lastDatePart.split(" ")[0]+" "+timingPart;
            var sendTime = document.createElement('div');
            sendTime.setAttribute("class","sendTime header");
            sendTime.innerText = timeToShow;
            timeContentDiv.appendChild(sendTime);

            // append message
            var message = document.createElement('p');
            // message.setAttribute("class","message col-md-8");
            message.innerText = element.message;
            timeContentDiv.appendChild(message);

        }

        msgPlaceHolder.append(singleMessage);
    })
})

// start chat
// When message submit by the user
submitBtn.addEventListener('click', (e) => { // (e) means event
    e.preventDefault();

    // Get message inserted by user
    let msg = document.querySelector("#userMsg").value;
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

// -------------- real time message part
socket.on('msgToShow',(data)=>{

    var singleMessage = document.createElement('li');

    if(data.sender == senderNow){
        singleMessage.setAttribute("class","right clearfix");

        // ------ append sender (self)
        var nowSender = document.createElement('span');
        nowSender.setAttribute("class","sender chat-img pull-right");
        nowSender.innerText = "You";
        singleMessage.appendChild(nowSender);

        // ------ append clearfix for time & message
        var timeContentDiv = document.createElement('div');
        timeContentDiv.setAttribute('class','chat-body clearfix');
        singleMessage.appendChild(timeContentDiv);

        // --------------- append time
        let dateTime = new Date();
        let DatePart=dateTime.toLocaleDateString('en-US').split("/");
        DatePart = DatePart[0]+"/"+DatePart[1];
        
        const timeOptions = {
            hour12: false,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
        };

        var timing = dateTime.toLocaleDateString('en-US', timeOptions);
        var timingTimePart = timing.split(",")[1].split(":");
        timingTimePart = timingTimePart[0]+":"+timingTimePart[1];
        var timeToShow = DatePart + " "+timingTimePart
        
        var sendTime = document.createElement('div');
        sendTime.setAttribute("class","sendTime header");
        sendTime.innerText = timeToShow;
        timeContentDiv.appendChild(sendTime);

        // --------------- append message
        var message = document.createElement('p');
        message.innerText = data.msg;
        timeContentDiv.appendChild(message);
        
        chatList.appendChild(singleMessage);
    }else{
        singleMessage.setAttribute("class","left clearfix");

        // ------ append sender (self)
        var nowSender = document.createElement('span');
        nowSender.setAttribute("class","sender chat-img pull-left");
        nowSender.innerText = data.sender;
        singleMessage.appendChild(nowSender);

        // ------ append clearfix for time & message
        var timeContentDiv = document.createElement('div');
        timeContentDiv.setAttribute('class','chat-body clearfix');
        singleMessage.appendChild(timeContentDiv);

        // --------------- append time
        let dateTime = new Date();
        let DatePart=dateTime.toLocaleDateString('en-US').split("/");
        DatePart = DatePart[0]+"/"+DatePart[1];
        
        const timeOptions = {
            hour12: false,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
        };

        var timing = dateTime.toLocaleDateString('en-US', timeOptions);
        var timingTimePart = timing.split(",")[1].split(":");
        timingTimePart = timingTimePart[0]+":"+timingTimePart[1];
        var timeToShow = DatePart + " "+timingTimePart
        
        var sendTime = document.createElement('div');
        sendTime.setAttribute("class","sendTime header");
        sendTime.innerText = timeToShow;
        timeContentDiv.appendChild(sendTime);

        // --------------- append message
        var message = document.createElement('p');
        message.innerText = data.msg;
        timeContentDiv.appendChild(message);
        
        chatList.appendChild(singleMessage);

    }
    
    

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