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

const searchButton = document.getElementById("btn-search");
const chooseSentimentButton = document.getElementById("btn-chooseSentiment");

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

// when click on submite button
searchButton.addEventListener("click",()=>{
    
    const firstSearchTopic = document.querySelector("#userInput1").value;
    const secondSearchTopic = document.querySelector("#userInput2").value;
    if(!firstSearchTopic){
        alert("Please input first search term!");
    }else{
        if(!secondSearchTopic){
            alert("Please provide at least 2 topics!");
        }else{
            console.log("Has 2 searched terms!");
            const searchTopic1 = document.querySelector("#userInput1").value;
            const searchTopic2 = document.querySelector("#userInput2").value;
            localStorage.setItem("searchTopic1", searchTopic1);
            localStorage.setItem("searchTopic2", searchTopic2);
            window.location.href = "/showNewsDots.html";
        }    
    }
});