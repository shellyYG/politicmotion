const sendEmailBtn = document.getElementById('sendEmail');

// trigger enter keyboard for sending out form
var usrMsg = document.getElementById('message');
usrMsg.addEventListener('keyup', function(event) {
    if (event.code === 'Enter') {
      event.preventDefault();
      sendEmailBtn.click();
    }
});


sendEmailBtn.addEventListener('click',()=>{
    // Do not have checkmark
    console.log("reached sendEmailBtn");
    console.log(document.getElementById('name').value, " | ", document.getElementById('email').value, " | ", document.getElementById('message').value);
    axios.post(`/user/contact`,{
      'customerName': document.getElementById('name').value,
      'customerEmail': document.getElementById('email').value,
      'customerMsg': document.getElementById('message').value
    }).then(res => {
      console.log("res.data after email sending: ",res.data);
      console.log("res.data.data after email sending: ",res.data.data);
      alert("Thank you! We have already received your feedback.");
      
      // clear input field after sent
      document.getElementById('name').value = "";
      document.getElementById('email').value = "";
      document.getElementById('message').value = "";


    })
  })