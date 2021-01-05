require("dotenv").config();
const nodeMailer = require('nodemailer');

const sendEmail = async (req, res) => { 
    let data = req.body; //should be customerName, customerEmail, customerMsg
    var mailTransport = nodeMailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'politicmotion@gmail.com',
            pass: process.env.EMAIL_PASS
        }
    });
    
    let customerName = data.customerName;
    let customerEmail = data.customerEmail;
    let customerMsg = data.customerMsg;

    var options = {
        from: 'Contact Page Msg <politicmotion@gmail.com>',
        to: `Contact Page Msg <politicmotion@gmail.com>` , 
        subject: `Contact page message`, 
        text: `From: ${customerEmail}, Message:${customerMsg}`
    };
    
    mailTransport.sendMail(options, function(err, info){
        if(err){
            console.log(err);
        }else{
            console.log('email sent: ' + info.response);
        }
    })

    let results = {};
    results.customerName = customerName;
    results.customerEmail = customerEmail;
    results.customerMsg = customerMsg;
    results.status = "Email successfully sent!";

    res.json({"data": results});
}

module.exports = {
    sendEmail
};