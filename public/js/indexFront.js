const discoverBtn = document.getElementById("btn-discover");
const logInBtn = document.getElementById("home-login");

logInBtn.addEventListener("click",()=>{
    window.location.href = "/signIn.html";
});

discoverBtn.addEventListener("click",()=>{
    window.location.href = "/search.html";
});