// use axios post for signup. rather than form
let signupT=document.querySelector("#btn_signup");
signupT.addEventListener('click',()=>{
  axios.post(`/user/signup`,{
    'name': document.querySelector("#signup_name").value,
    'password': document.querySelector("#signup_password").value,
    'email': document.querySelector("#signup_email").value
  }).then(res =>{
    let token = res.data.data.access_token;
    console.log("response data is:", res.data.data);
    window.localStorage.setItem('generalToken',token);
    window.location.href=`/user/signup`; //get to user/signup
  }).catch(err =>{
    console.log(err);
  });
  
});

// // General function
// function get(selector){
//   return document.querySelector(selector);
// }
