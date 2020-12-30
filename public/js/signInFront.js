// go to signUp page when clicked
let signUpT = document.querySelector("#signUpBtn");

signUpT.addEventListener("click",()=>{
  window.location.href="/signUp.html";
});

// use axios post for signup. rather than form
let signInT = document.querySelector("#btn_signin");

// change login to logout if there is token
if(localStorage.getItem('generalToken')){
  alert("You already logged in! To log in as another user, please click on log out button on the top.");
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

signInT.addEventListener("click",()=>{
  axios.post("/user/signIn",{
    "email": document.querySelector("#signInEmail").value,
    "password": document.querySelector("#signInPass").value
  }).then(res =>{
    console.log(res.data);
    let token = res.data.data.access_token;
    console.log("token is:", token);
    window.localStorage.setItem("generalToken",token);
    alert("Successfully signed in!");
    window.location.href="/search.html";
  }).catch(err =>{
    console.log(err);
  });
  
});

// General function
function get(selector){
  return document.querySelector(selector);
}