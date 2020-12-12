require('dotenv').config()
const express = require('express');
const bodyParser= require('body-parser');
const router = express.Router();
const app = express();
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); //create json web token


const { query } = require('../../models/query');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false})); 

//--------------------------------Define a function to generate user-----------------------------------//
// create a token that will expire
function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10800s' }) //3hr
}
//-------------------------------After frontend post form to backend server----------------------------//
//api to store user sign up data
router.post('/',(req, res, next)=> {
    console.log("Start Posting on Sign up page");
    const data = req.body;
    
    //-------------------------------------------------------------------------------Encrypt password
    //Generate the algo to create hashed password later
    crypto.randomBytes(16, (err, buf)=> {});
    let iv = crypto.randomBytes(16); //it will be different everytime you refresh your GET request
  
    //-----get the ivString
    let ivString = iv.toString('base64');
    
    let password = data.password;
    let key = process.env.ACCESS_TOKEN_KEY; 
    let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);//first argument is the encryption type, aka ('aes-256-cbc')
    let encryptedpass = cipher.update(password, 'utf-8','hex'); //I feed you utf-8, output should be hex
    encryptedpass += cipher.final('hex'); //append
    console.log('encrypted password is: ', encryptedpass);
    
    //-------------------------------------------------------------------------------Decrypt password
    let ivBack = Buffer.from(ivString, 'base64');
    console.log('ivBack is:', ivBack);

    let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decryptedpass = decipher.update(encryptedpass, 'hex', 'utf-8');
    decryptedpass += decipher.final('utf-8');
    
    //-------------------------------------------------------------------------------Create new user in DB
    async function insertUser(){
        let insertedData = {
            provider: "native",
            username: data.name,
            email: data.email,
            encryptpass: encryptedpass,
            ivString: ivString
            };
        let sql = 'INSERT INTO user_basic SET ?';
        let sqlquery = await query(sql, insertedData);
        return sqlquery;
    }

    async function getLatestUserId(){
        let insertUserResult = await insertUser();
        let latestUserId = insertUserResult.insertId;
        return latestUserId;
    }

    async function getUserRawAttribute(){
        let userId = await getLatestUserId();
        console.log("Latest user ID is:", userId);
        let sqlUserAttri = 
        `SELECT id, provider, username, email, encryptpass FROM politicmotion.user_basic WHERE id =${userId}`;
        let userAttribute = await query(sqlUserAttri);
        return userAttribute;
    }

    async function createUserObject(){
        let userRawAttri = await getUserRawAttribute();
        let userObject = {};
        userObject['id']= userRawAttri[0]["id"];
        userObject['provider']= userRawAttri[0]["provider"];
        userObject['name']= userRawAttri[0]["username"];
        userObject['email']= userRawAttri[0]["email"];
        // userObject['picture']= 'http://3.138.56.214'+userRawAttri[0]["picture"];
        let finalObject = {};
        let dataObject = {};
        dataObject["user"] = userObject;
        finalObject["data"] = dataObject;

        let payloadObject = {};
        payloadObject["data"]= userObject;
        //----------------------------------------------------------------Create token to send to frontend
        //Create user payload (aka data)
        const payload = payloadObject;
        const accessToken = generateAccessToken(payload); //get access token
        
        dataObject["access_token"] = accessToken;

        // Verify token to get lifetime for token
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) return res.send('You are too long away. Please sign in again.');
            else {
                console.log("Payload is",payload);
                dataObject["access_expired"] = payload.exp-payload.iat; //add lifetime to object for printing out
            }
        })
        
        console.log("finalObject from signUp api is:", finalObject);
        
        res.json(finalObject);
        
    }

    createUserObject();
});

module.exports = router; 