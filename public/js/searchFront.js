var keyArr = [];
for (i=0; i<localStorage.length; i++){
    if (localStorage.key(i).substring(0,7) == "emotion"){
        keyArr.push(localStorage.key(i));
    }
}

var emotionArray = [];
for (i=0; i < keyArr.length; i++){
    localStorage.removeItem(keyArr[i]);
}

const searchButton = document.getElementById("btn-search-home");
const latestNewsBtn = document.getElementById("btn-latest-news");

// change login to logout if there is token
if(localStorage.getItem('generalToken')){
    const logInNav = document.getElementById('logInNav');
    logInNav.setAttribute('class', 'hiddenc');
  
    const navUl = document.getElementById('navUl');
    const logoutList = document.createElement('li');
    const logoutLink = document.createElement('a');
    
    logoutList.setAttribute('class', 'nav-item');
    logoutLink.setAttribute('class', 'nav-link');
    logoutLink.setAttribute('id', 'logoutLink');
    logoutLink.innerText = 'LOG OUT';
  
    navUl.appendChild(logoutList);
    logoutList.appendChild(logoutLink);
}
  
// log out section triggered
var existedLogoutLink = document.getElementById('logoutLink');
if(existedLogoutLink){
    existedLogoutLink.addEventListener('click', ()=>{
        localStorage.removeItem('generalToken');
        alert("Successfully logged out!");
        const logInNavReshow = document.getElementById('logInNav');
        logInNavReshow.setAttribute('class', 'nav-item'); //show log in
        existedLogoutLink.setAttribute('class', 'hiddenc'); //hide log out
    })
}
  
// trigger enter keyboard for sending out form
var userInput2 = document.getElementById("userInput2");
userInput2.addEventListener('keyup', function(event) {
    if (event.code === 'Enter') {
      event.preventDefault();
      searchButton.click();
    }
});

latestNewsBtn.addEventListener("click",()=>{
    window.location.href = "/latestNews.html";
})

// when click on submit button
searchButton.addEventListener("click",()=>{
    
    const firstSearchTopic = document.querySelector("#userInput1").value;
    const secondSearchTopic = document.querySelector("#userInput2").value;
    if(!firstSearchTopic){
        alert("Please input first search term!");
    }else{
        if(!secondSearchTopic){
            alert("Please provide at least 2 topics!");
        }else{
            // Has 2 searched terms
            const searchTopic1 = document.querySelector("#userInput1").value;
            const searchTopic2 = document.querySelector("#userInput2").value;
            localStorage.setItem("searchTopic1", searchTopic1);
            localStorage.setItem("searchTopic2", searchTopic2);
            
            // Find buddies first in case people want to go to chat room directly
            const generalToken = localStorage.getItem("generalToken");
            if (generalToken){
                const headers = {
                    "Content-Type": "application/json",
                    Authorization: "Bearer" + " " + generalToken
                };
                
                axios.post("findBuddies", {
                    "firstSearchTopic": searchTopic1,
                    "secondSearchTopic": searchTopic2
                }, { headers: headers })
                    .then(res => {
                        console.log("res userEmotionFront: ", res);
                        if (res.data.buddyNames.length == null){
                            alert("Sorry, we found no one who has searched for the same topics.");
                        }else{
                            const buddyNamesRank = res.data.buddyNames;
                            const topBuddyNames = res.data.topBuddyNames;
                            const buddySignatures = res.data.buddySignatures;
                            const topBuddySignatures = res.data.topBuddySignatures;
                            const clickedEmotions = localStorage.removeItem("clickedEmotions");
                            if(!clickedEmotions){
                                // do not have top matches partner (because no emotion yet to match)
                                localStorage.removeItem("topBuddyNames");
                                localStorage.removeItem("topBuddySignatures");
                                localStorage.removeItem("buddiesToChat");
                                for (i = 0; i < buddyNamesRank.length; i++) {
                                    var buddiesToChat = localStorage.getItem("buddiesToChat");
                                    var buddiesToChatArray = [];
                                    if (buddiesToChat) {
                                        buddiesToChatArray = JSON.parse(buddiesToChat);
                                    }
                                    buddiesToChatArray.push({ "buddies": buddyNamesRank[i] });
                                    localStorage.setItem("buddiesToChat", JSON.stringify(buddiesToChatArray));
                                }
                                localStorage.removeItem("buddySignatures");
                                for (i = 0; i < buddySignatures.length; i++) {
                                    var buddySignaturesToChat = localStorage.getItem("buddySignatures");
                                    var buddySignaturesArray = [];
                                    if (buddySignaturesToChat) {
                                        buddySignaturesArray = JSON.parse(buddySignaturesToChat);
                                    }
                                    buddySignaturesArray.push({ "signatures": buddySignatures[i] });
                                    localStorage.setItem("buddySignatures", JSON.stringify(buddySignaturesArray));
                                }
                                window.location.href = "/showNewsDots.html";
    
                            }else{
                                // can have top matched partners
                                localStorage.removeItem("topBuddyNames");
                                localStorage.removeItem("topBuddySignatures");
                                localStorage.setItem("topBuddyNames", topBuddyNames);
                                localStorage.setItem("topBuddySignatures", topBuddySignatures);
                                localStorage.removeItem("buddiesToChat");
                                for (i = 0; i < buddyNamesRank.length; i++) {
                                    var buddiesToChat = localStorage.getItem("buddiesToChat");
                                    var buddiesToChatArray = [];
                                    if (buddiesToChat) {
                                        buddiesToChatArray = JSON.parse(buddiesToChat);
                                    }
                                    buddiesToChatArray.push({ "buddies": buddyNamesRank[i] });
                                    localStorage.setItem("buddiesToChat", JSON.stringify(buddiesToChatArray));
                                }
                                localStorage.removeItem("buddySignatures");
                                for (i = 0; i < buddySignatures.length; i++) {
                                    var buddySignaturesToChat = localStorage.getItem("buddySignatures");
                                    var buddySignaturesArray = [];
                                    if (buddySignaturesToChat) {
                                        buddySignaturesArray = JSON.parse(buddySignaturesToChat);
                                    }
                                    buddySignaturesArray.push({ "signatures": buddySignatures[i] });
                                    localStorage.setItem("buddySignatures", JSON.stringify(buddySignaturesArray));
                                }
                                window.location.href = "/showNewsDots.html";
    
                            }
                            
                        }
                    })
                    .catch(error => {
                        alert("Sorry, you are too long away. Please log in again.");
                        window.location.href = '/signIn.html';
                    })
            }else{
                window.location.href = "/showNewsDots.html";
            }
        }    
    }
});