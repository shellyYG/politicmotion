const socket = io();

let buddiesToChat = localStorage.getItem("buddiesToChat");
buddiesToChat = JSON.parse(buddiesToChat);
let topBuddyNames = localStorage.getItem("topBuddyNames");

if(buddiesToChat == null){
    alert("Sorry, no one has searched for the same topic yet.");
    window.location.href = '/userEmotion.html';
}

let buddyNames = buddiesToChat.map(element => element.buddies);
const chatForm = document.getElementById('chat-form');
const submitBtn = document.getElementById('sendMsgBtn');
const msgPlaceHolder = document.getElementById('chatList');
const partnerContainer = document.getElementById('friend-list');
const startChatBtn = document.getElementById('startChat');
const sendMsgBtn = document.getElementById('sendMsgBtn');
let selfNameForExcl;
let senderNow;
let receiver;
let selfNameDiv = document.getElementById('selfName');
let topicOne = localStorage.getItem('searchTopic1');
let topicTwo = localStorage.getItem('searchTopic2');
let dropdownBtn = document.querySelector('.dropbtn');

let step1 = document.getElementById('step1');
let step2 = document.getElementById('step2');
let step3 = document.getElementById('step3');
let step4 = document.getElementById('step4');
step1.addEventListener(('click'), ()=>{
    window.location.href = '/showNewsDots.html'
})
step2.addEventListener(('click'), ()=>{
    window.location.href = '/showNewsContent.html'
})
step3.addEventListener(('click'), ()=>{
    window.location.href = '/userEmotion.html'
})
step4.addEventListener(('click'), ()=>{
    window.location.href = '/chat.html'
})

const chatList = document.getElementById('chatList');

function unique(value, index, self) {
    return self.indexOf(value) === index;
}

var topBuddyNamesPart = topBuddyNames.split(",");

buddiesToChat = buddiesToChat.filter(unique);

for (i = 0; i < buddiesToChat.length; i++) {
    var singleBuddy = document.createElement('li');
    singleBuddy.setAttribute("class", "active bounceInDown singleBuddy");

    var statusDiv = document.createElement('div');
    statusDiv.setAttribute('class', 'friend-name');

    var statusSmall = document.createElement('small');
    statusSmall.setAttribute('class', 'chat-alert label label-danger');
    statusSmall.setAttribute('id', 'label-danger');
    statusSmall.innerText = 'offline';

    var nameStrong = document.createElement('partnerName');
    nameStrong.setAttribute("id", "StrongName");
    nameStrong.innerText = buddiesToChat[i].buddies;

    statusDiv.appendChild(statusSmall);
    statusDiv.appendChild(nameStrong);

    // add star for top partner
    if (topBuddyNamesPart.includes(buddiesToChat[i].buddies)){
        var star = document.createElement('img');
        star.setAttribute('src','imgs/iconx/star.png');
        star.setAttribute('id','starIcon');
        statusDiv.appendChild(star);
    }


    singleBuddy.appendChild(statusDiv);

    partnerContainer.appendChild(singleBuddy);
}
const tokenTest = () => {
    return new Promise((resolve, reject) => {
        let query = {
            generalToken: localStorage.getItem("generalToken"),
            buddyNames: buddyNames
        }
        resolve(query)
    })
}
// console.log("F1");
socket.on("getToken", () => {
    // console.log("F2");
    tokenTest().then(result => {
        socket.emit("verifyToken", (result))
        // console.log("F3");
    })
});
socket.on("AuthError", (msg) => {
    alert("You are too long away. Please sign in again.")
    window.location.replace("/signIn.html")
    // console.log("F4 Auth Error");
});

socket.on('Self', (self) => {
    // console.log("F4");
    selfNameForExcl = self.self;
    senderNow = self.self;
    selfNameDiv.innerText = `Welcome to chat, ${self.self}!`;

    var instruction = document.createElement('div');
    instruction.innerText = 'Most similar partner is marked with a '
    instruction.setAttribute('id','instruction-for-star');
    selfNameDiv.appendChild(instruction);
    
    var instructionStar = document.createElement('img');
    instructionStar.setAttribute('src','imgs/iconx/star.png');
    instructionStar.setAttribute('id','starIcon');
    instruction.appendChild(instructionStar);
    socket.emit('newUserUser');
    // console.log("F5");
});

// change color to green when online
socket.on("onlineUsers", (onlineUserList) => {
    // console.log("F6");
    var potentialPartners = document.querySelectorAll('partnerName');
    // console.log("onlineUsers: ", onlineUserList);
    for (i = 0; i < potentialPartners.length; i++) {
        if (onlineUserList.includes(potentialPartners[i].innerText)) {
            var statusSmall = document.querySelectorAll('small');
            statusSmall[i].setAttribute('class', 'chat-alert label label-success'); // -1 because [0] means Welcome to chat
            statusSmall[i].setAttribute('id', 'label-success');
            statusSmall[i].innerText = 'online';
        }
    }
    // console.log("F7");
});

// select chat partner 
var potentialPartners = document.querySelectorAll('partnerName');
var potentialPartnerDivs = document.querySelectorAll('.singleBuddy');

potentialPartnerDivs.forEach((element) => {
    element.addEventListener('click', () => {
        // clear all highlights from other elements
        var partnerForClean = document.querySelectorAll('.singleBuddy');
        partnerForClean.forEach((e) => {
            e.removeAttribute('id');
        })
        // add highlight color for partner selected
        element.setAttribute('id', 'singleBuddySelected');
        // set local Storage to send to back-end
        localStorage.setItem('receiver', element.childNodes[0].childNodes[1].innerText);
        receiver = localStorage.getItem("receiver");
        console.log("receiver: ", receiver);
        socket.emit('receiver', {receiver: receiver, topicOne: topicOne, topicTwo: topicTwo}); //send to all server
        console.log(`${receiver} sent to back-end!`);
    })
})

// Load the history
socket.on('history', (data) => {
    console.log("history : ", data);
    // empty history with other people
    msgPlaceHolder.innerHTML = "";

    if(data.length == 0){
        var defaultTextHolder = document.createElement('div');
        defaultTextHolder.setAttribute('id','default-select-user-text');

        // var defaultNoHistory = document.createElement('p');
        // defaultNoHistory.setAttribute('class', 'default-no-chat-history-text');
        // defaultNoHistory.innerHTML = "You haven't chat yet! Start chatting by typing something below!"
        // msgPlaceHolder.appendChild(defaultNoHistory);

        var infoImg = document.createElement('img');
        infoImg.setAttribute('id', 'info-img');
        infoImg.setAttribute('src','imgs/iconx/info.png');

        var defaultSelectUserText = document.createElement('p');
        defaultSelectUserText.innerText = "You haven't chat yet! Start chatting by typing something below!";
        defaultSelectUserText.setAttribute('id', 'default-select-user-inner-text');

        defaultTextHolder.appendChild(infoImg);
        defaultTextHolder.appendChild(defaultSelectUserText);
        msgPlaceHolder.appendChild(defaultTextHolder);
    }

    // add history with others
    data.forEach(element => {
        var singleMessage = document.createElement('li');

        // switch sender & receiver based on if it's self
        if (element.sender == senderNow) { //if its self, add to sender class
            console.log("sender is self");
            singleMessage.setAttribute("class", "right clearfix");
            // append sender (self)
            var historySender = document.createElement('span');
            historySender.setAttribute("class", "sender chat-img pull-right");
            historySender.setAttribute("id", "senderNameDisplay");
            historySender.innerText = "You";
            singleMessage.appendChild(historySender);

            // ------ append clearfix for time & message
            var timeContentDiv = document.createElement('div');
            timeContentDiv.setAttribute('class', 'chat-body clearfix');
            singleMessage.appendChild(timeContentDiv);

            // append time
            var re = /([^T]+)/;
            var pureDatePart = element.message_time.split(re);
            var DatePart = pureDatePart[1].split("-");
            var lastDatePart = DatePart[2];
            var timePart = lastDatePart.split(" ")[1];
            var timingPart = timePart.split(":")[0] + ":" + timePart.split(":")[1];
            var timeToShow = DatePart[1] + "/" + lastDatePart.split(" ")[0] + " " + timingPart;

            var sendTime = document.createElement('div');
            sendTime.setAttribute("class", "sendTime header");
            sendTime.innerText = timeToShow;
            timeContentDiv.appendChild(sendTime);

            // append message
            var message = document.createElement('p');
            // message.setAttribute("class","message col-md-8");
            message.innerText = element.message;
            timeContentDiv.appendChild(message);

        } else if (element.receiver == senderNow) { //switch
            console.log("sender is not self");
            singleMessage.setAttribute("class", "left clearfix");
            // append sender (other people)
            var historySender = document.createElement('span');
            historySender.setAttribute("class", "sender chat-img pull-left");
            historySender.setAttribute("id", "non-self-senderNameDisplay");
            historySender.innerText = element.sender;
            singleMessage.appendChild(historySender);

            // ------ append clearfix for time & message
            var timeContentDiv = document.createElement('div');
            timeContentDiv.setAttribute('class', 'chat-body clearfix');
            singleMessage.appendChild(timeContentDiv);

            // append time
            var re = /([^T]+)/;
            var pureDatePart = element.message_time.split(re);
            var DatePart = pureDatePart[1].split("-");
            var lastDatePart = DatePart[2];
            var timePart = lastDatePart.split(" ")[1];
            var timingPart = timePart.split(":")[0] + ":" + timePart.split(":")[1];
            var timeToShow = DatePart[1] + "/" + lastDatePart.split(" ")[0] + " " + timingPart;
            var sendTime = document.createElement('div');
            sendTime.setAttribute("class", "sendTime header");
            sendTime.innerText = timeToShow;
            timeContentDiv.appendChild(sendTime);

            // append message
            var message = document.createElement('p');
            message.innerText = element.message;
            timeContentDiv.appendChild(message);

        }

        msgPlaceHolder.append(singleMessage);

        // make scroll bar default to bottom
        var messageBody = document.querySelector('.scroll-message');
        messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;

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

    if (!msg) {
        return false;
    }
    socket.emit('userSendMsg', {
        msg: msg,
        sender: senderNow,
        receiver: receiver
    });

})

// -------------- real time message part
socket.on('msgToShow', (data) => {

    var singleMessage = document.createElement('li');

    if (data.sender == senderNow) { // --------------------- shown on sender side
        singleMessage.setAttribute("class", "right clearfix");

        // ------ append sender (self)
        var nowSender = document.createElement('span');
        nowSender.setAttribute("class", "sender chat-img pull-right");
        nowSender.setAttribute("id", "senderNameDisplay");
        nowSender.innerText = "You";
        singleMessage.appendChild(nowSender);

        // ------ append clearfix for time & message
        var timeContentDiv = document.createElement('div');
        timeContentDiv.setAttribute('class', 'chat-body clearfix');
        singleMessage.appendChild(timeContentDiv);

        // --------------- append time
        let dateTime = new Date();
        let DatePart = dateTime.toLocaleDateString('en-US').split("/");
        DatePart = DatePart[0] + "/" + DatePart[1];

        const timeOptions = {
            hour12: false,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
        };

        var timing = dateTime.toLocaleDateString('en-US', timeOptions);
        var timingTimePart = timing.split(",")[1].split(":");
        timingTimePart = timingTimePart[0] + ":" + timingTimePart[1];
        var timeToShow = DatePart + " " + timingTimePart

        var sendTime = document.createElement('div');
        sendTime.setAttribute("class", "sendTime header");
        sendTime.innerText = timeToShow;
        timeContentDiv.appendChild(sendTime);

        // --------------- append message
        var message = document.createElement('p');
        message.innerText = data.msg;
        timeContentDiv.appendChild(message);


        // add chat
        chatList.appendChild(singleMessage);

        // make scroll bar default to bottom
        var messageBody = document.querySelector('.scroll-message');
        messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;

        // clear user input box
        var userMsgForClear = document.querySelector('#userMsg');
        userMsgForClear.value = "";

    } else { // -------------------------------------- shown on receiver side
        singleMessage.setAttribute("class", "left clearfix");

        // ------ append sender (self)
        var nowSender = document.createElement('span');
        nowSender.setAttribute("class", "sender chat-img pull-left");
        nowSender.setAttribute("id", "non-self-senderNameDisplay");
        nowSender.innerText = data.sender;
        singleMessage.appendChild(nowSender);

        // ------ append clearfix for time & message
        var timeContentDiv = document.createElement('div');
        timeContentDiv.setAttribute('class', 'chat-body clearfix');
        singleMessage.appendChild(timeContentDiv);

        // --------------- append time
        let dateTime = new Date();
        let DatePart = dateTime.toLocaleDateString('en-US').split("/");
        DatePart = DatePart[0] + "/" + DatePart[1];

        const timeOptions = {
            hour12: false,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
        };

        var timing = dateTime.toLocaleDateString('en-US', timeOptions);
        var timingTimePart = timing.split(",")[1].split(":");
        timingTimePart = timingTimePart[0] + ":" + timingTimePart[1];
        var timeToShow = DatePart + " " + timingTimePart

        var sendTime = document.createElement('div');
        sendTime.setAttribute("class", "sendTime header");
        sendTime.innerText = timeToShow;
        timeContentDiv.appendChild(sendTime);

        // --------------- append message
        var message = document.createElement('p');
        message.innerText = data.msg;
        timeContentDiv.appendChild(message);

        chatList.appendChild(singleMessage);

        // make scroll bar default to bottom
        var messageBody = document.querySelector('.scroll-message');
        messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;


    }
})

socket.on("userDisconnected", (disconnectUserName) => {
    console.log("F8");
    var potentialPartners = document.querySelectorAll('partnerName');
    for (i = 0; i < potentialPartners.length; i++) {
        // console.log("potentialPartners[i].innerText: ", potentialPartners[i].innerText, "disconnectUserName", disconnectUserName);
        if (potentialPartners[i].innerText == disconnectUserName) {
            console.log("remove color");
            var statusSmall = document.querySelectorAll('small');
            statusSmall[i].setAttribute('class', 'chat-alert label label-danger');
            statusSmall[i].setAttribute('id', 'label-danger');
            statusSmall[i].innerText = 'offline';
            // clear localStorage chat partner list
        }
    }
    // console.log("disconnectUserName: ", disconnectUserName);
})

// add topics when clicked
dropdownBtn.addEventListener('click',()=>{
    myDropdown.setAttribute('class', 'dropdown-content show'); // show the dropdown
    // append the list of topics
    socket.emit("search topics");
})
var dropDownLists = document.getElementById('myDropdown');

socket.on('allTopics',(topics)=>{
    topics.forEach((t)=>{
        topicList = document.createElement('a');
        topicList.setAttribute('id', `topic_${t}`);
        topicList.innerText = t;
        dropDownLists.appendChild(topicList);
    })
    var historicTopics = document.querySelectorAll('[id^="topic_"]');
    historicTopics.forEach((topic)=>{
        topic.addEventListener('click',()=>{
            var myDropDownToHide = document.getElementById('myDropdown');
            myDropDownToHide.setAttribute('class', 'dropdown-content');
            var clickedTopic = topic.getAttribute('id').split("_")[1];
            socket.emit('topics clicked', clickedTopic);
        })
    })
})

socket.on('other partners', (partnerList)=>{
    console.log("partnerList: ", partnerList);
    partnerContainer.innerHTML = ''; // clear all existing buddies

    var starDiv = document.getElementById('instruction-for-star');
    starDiv.innerHTML = ''; // clear star default message
    msgPlaceHolder.innerHTML = ''; // clear chat history

    var defaultTextHolder = document.createElement('div');
    defaultTextHolder.setAttribute('id','default-select-user-text');
    
    var infoImg = document.createElement('img');
    infoImg.setAttribute('id', 'info-img');
    infoImg.setAttribute('src','imgs/iconx/info.png');

    var defaultSelectUserText = document.createElement('p');
    defaultSelectUserText.innerText = 'Select a user on the left side to start chatting!';
    defaultSelectUserText.setAttribute('id', 'default-select-user-inner-text');

    defaultTextHolder.appendChild(infoImg);
    defaultTextHolder.appendChild(defaultSelectUserText);
    msgPlaceHolder.appendChild(defaultTextHolder);

    for (i = 0; i < partnerList.length; i++) {
        if(partnerList[i] !== selfNameForExcl){
            var singleBuddy = document.createElement('li');
            singleBuddy.setAttribute("class", "active bounceInDown singleBuddy");
        
            var statusDiv = document.createElement('div');
            statusDiv.setAttribute('class', 'friend-name');
        
            var statusSmall = document.createElement('small');
            statusSmall.setAttribute('class', 'chat-alert label label-danger');
            statusSmall.setAttribute('id', 'label-danger');
            statusSmall.innerText = 'offline';
        
            var nameStrong = document.createElement('partnerName');
            nameStrong.setAttribute("id", "StrongName");
            nameStrong.innerText = partnerList[i];
        
            statusDiv.appendChild(statusSmall);
            statusDiv.appendChild(nameStrong);
        
            singleBuddy.appendChild(statusDiv);
        
            partnerContainer.appendChild(singleBuddy);
        }
    }

    // select chat partner 
    var potentialPartnerDivs = document.querySelectorAll('.singleBuddy');

    potentialPartnerDivs.forEach((element) => {
        element.addEventListener('click', () => {
            // clear all highlights from other elements
            var partnerForClean = document.querySelectorAll('.singleBuddy');
            partnerForClean.forEach((e) => {
                e.removeAttribute('id');
            })
            // add highlight color for partner selected
            element.setAttribute('id', 'singleBuddySelected');
            // set local Storage to send to back-end
            localStorage.setItem('receiver', element.childNodes[0].childNodes[1].innerText);
            receiver = localStorage.getItem("receiver");
            console.log("receiver: ", receiver);
            socket.emit('receiver', {receiver: receiver, topicOne: topicOne, topicTwo: topicTwo}); //send to all server
            console.log(`${receiver} sent to back-end!`);
        })
    })

})


