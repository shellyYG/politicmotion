// go to signIn (LogIn) page when clicked
let signInT = document.querySelector("#signInBtn");

signInT.addEventListener('click',()=>{
  window.location.href="/signin.html"
})

// use axios post for signup. rather than form
let signupT=document.querySelector("#btn_signUp");
signupT.addEventListener('click',()=>{
  axios.post(`/user/signup`,{
    'name': document.querySelector("#signUpName").value,
    'password': document.querySelector("#signUpPass").value,
    'email': document.querySelector("#signUpEmail").value,
    'signature': document.querySelector("#signature").value
  }).then(res =>{
    if(res.data == 'username already existed!'){
      alert("Oops! This nickname is already used.");
    }else if(res.data == 'email already existed!'){
      alert("Oops! The email is already used.")
    }else{
      let token = res.data.data.access_token;
      console.log("response data is:", res.data.data);
      window.localStorage.setItem('generalToken',token);
      alert("Successfully signed up! Now you can start to search & chat!")
      window.location.href=`/search.html`;
    }
     
  }).catch(err =>{
    console.log(err);
  });
  
});


