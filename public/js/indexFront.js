const discoverBtn = document.getElementById("btn-discover");
const logInBtn = document.getElementById("home-login");
const latestNewsBtn = document.getElementById("btn-latest-news");

logInBtn.addEventListener("click",()=>{
    window.location.href = "/signIn.html";
});

discoverBtn.addEventListener("click",()=>{
    window.location.href = "/search.html";
});

latestNewsBtn.addEventListener("click",()=>{
    window.location.href = "/latestNews.html";
})

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
  