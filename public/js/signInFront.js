
// use axios post for signup. rather than form
let signupT=document.querySelector("#btn_signin");
signupT.addEventListener('click',()=>{
  axios.post(`/user/signin`,{
    'email': document.querySelector("#signin_email").value,
    'password': document.querySelector("#signin_password").value
  }).then(res =>{
    let token = res.data.data.access_token;
    console.log("token is:", token);
    window.localStorage.setItem('generalToken',token);
    window.location.href=`/profile.html`;
  }).catch(err =>{
    console.log(err);
  });
  
});

// General function
function get(selector){
  return document.querySelector(selector);
}