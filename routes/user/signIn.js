require('dotenv').config()
const express = require('express');
const bodyParser= require('body-parser');
const router = express.Router();
const { query } = require('../../models/query');
const app = express();
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); //create json web token

app.use(bodyParser.urlencoded({ extended: false})); 

//--------------------------------Define a function to generate user-----------------------------------//
// create a token that will expire
function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' }) //30 sec. 10m: 10min //user is the payload
}

//api to store user sign in data
router.post('/',(req, res, next)=> {
    const data = req.body;
    //Insert data
    async function insertLoginUser(){
        let email = req.body.email;
        console.log('email is:', email);
        let sql = `SELECT id, provider, username, email, encryptpass, ivString, substr(picture,7) AS picture FROM stylish.tbluser WHERE email = '${email}'`;
        let userLoginInput = await query(sql);
        console.log('insertLoginUser result is (aka userLoginInput):', userLoginInput)
        return userLoginInput; 
    }

    async function getLogInUserPass(){
        let LoginUserResult = await insertLoginUser();
        console.log('LoginUserResult is',LoginUserResult);
        let LoginUserResultivString = LoginUserResult[0]["ivString"];
        
        let password = data.password;
        let key = 'taiwannumberonenybullshitischina'; //need to be =32 length (required by aes 256)
        let ivBack = Buffer.from(LoginUserResultivString, 'base64');
        let cipher = crypto.createCipheriv('aes-256-cbc', key, ivBack);//first argument is the encryption type, aka ('aes-256-cbc')
        let encryptedLoginPass = cipher.update(password, 'utf-8','hex'); //I feed you utf-8, output should be hex
        encryptedLoginPass += cipher.final('hex'); //append
        console.log('encrypted login password is: ', encryptedLoginPass);

        let decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBack);
        let decryptedLoginpass = decipher.update(encryptedLoginPass, 'hex', 'utf-8');

        decryptedLoginpass += decipher.final('utf-8');
        console.log("Login encrypted pass is", encryptedLoginPass);
        return encryptedLoginPass;
    }

    async function comparepass(){
        let LoginUserResult = await insertLoginUser();
        console.log('LoginUserResult is',LoginUserResult);
        let DataBasePass = LoginUserResult[0]["encryptpass"];
        let userPass = await getLogInUserPass();
        console.log("Encrypted sign-in password is:", userPass);
        console.log("Encrypted User pass in database is:", DataBasePass);
        if (userPass == DataBasePass) {
            console.log("Encrypted Login pass == stored user pass");
            console.log('user Raw Attri is', LoginUserResult);
            let userObject = {};
            userObject['id']= LoginUserResult[0]["id"];
            userObject['provider']= LoginUserResult[0]["provider"];
            userObject['name']= LoginUserResult[0]["username"];
            userObject['email']= LoginUserResult[0]["email"];
            userObject['picture']= 'http://3.138.56.214'+LoginUserResult[0]["picture"];
            let finalObject = {};
            let dataObject = {};
            
            dataObject["user"] = userObject;
            finalObject["data"] = dataObject;
            
            let payloadObject = {};
            payloadObject["data"]= userObject;
            
            //--------------------------------------------------------------------------------------Token
            //Create user payload (aka data)
            const payload = payloadObject;
            const accessToken = generateAccessToken(payload); //get access token

            dataObject["access_token"] = accessToken;
            dataObject["access_expired"] = 30;

            // res.cookie('TokenForAccess',accessToken); //send token in the cookie
            res.send(finalObject);

        } else {
            res.send('Wrong password!');
        }
    }
    comparepass();
    
});


module.exports = router; 