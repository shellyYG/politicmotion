
// use axios post for signup. rather than form
let signupT=document.querySelector("#btn_signin");
signupT.addEventListener('click',()=>{
  axios.post(`/user/signIn`,{
    'email': document.querySelector("#signInEmail").value,
    'password': document.querySelector("#signInPass").value
  }).then(res =>{
    let token = res.data.data.access_token;
    console.log("token is:", token);
    window.localStorage.setItem('generalToken',token);
    alert("Successfully signed in!");
    window.location.href=`/`;
  }).catch(err =>{
    console.log(err);
  });
  
});

// General function
function get(selector){
  return document.querySelector(selector);
}