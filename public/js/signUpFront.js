// go to signIn (LogIn) page when clicked
let signInT = document.querySelector("#signInBtn");
const signUpT=document.querySelector("#btn_signUp");

signInT.addEventListener("click",()=>{
  window.location.href="/signin.html";
});

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
var signUpPass = document.getElementById("signUpPass");
signUpPass.addEventListener('keyup', function(event) {
    if (event.code === 'Enter') {
      event.preventDefault();
      signUpT.click();
    }
});

// when submit btn is clicked
signUpT.addEventListener("click",()=>{
  axios.post("/user/signup",{
    "name": document.querySelector("#signUpName").value,
    "password": document.querySelector("#signUpPass").value,
    "email": document.querySelector("#signUpEmail").value,
    "signature": document.querySelector("#signature").value
  }).then(res =>{
    if(res.data == "username already existed!"){
      alert("Oops! This nickname is already used.");
    }else if(res.data == "email already existed!"){
      alert("Oops! The email is already used.");
    }else{
      let token = res.data.data.access_token;
      console.log("response data is:", res.data.data);
      window.localStorage.setItem("generalToken",token);
      alert("Successfully signed up! Now you can start to search & chat!");
      window.location.href="/search.html";
    }
     
  }).catch(err =>{
    console.log(err);
  });
  
});


