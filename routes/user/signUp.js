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
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '120s' }) //30 sec. 10m: 10min
}
//-------------------------------After frontend post form to backend server----------------------------//
//api to store user sign up data
router.post('/',(req, res, next)=> {
    console.log("Start Posting on Sign up page");
    const data = req.body;
    // const userImagepath=req.files[0]["path"];
    const userImagepath='public/images/uploads/2020-10-26T02:50:01.346Zcart-remove-hover.png';
    console.log("I am req.files:",userImagepath);
    //-------------------------------------------------------------------------------Encrypt password
    //Generate the algo to create hashed password later
    crypto.randomBytes(16, (err, buf)=> {});
    let iv = crypto.randomBytes(16); //it will be different everytime you refresh your GET request
  
    
    //-----get the ivString
    console.log("iv is:", iv);
    let ivString = iv.toString('base64');
    console.log("ivString is:", ivString);
    
    //-----create hash 
    let hash = crypto
        .createHash('sha256') //algo you wanna use
        .update('your message') //the msg you wanna hash later
        .digest('hex'); //digest into hex form for you to use
    
      
    let password = data.password;
    let key = 'taiwannumberonenybullshitischina'; //need to be =32 length (required by aes 256)
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
    console.log('dncrypted password is: ', decryptedpass);
    
    //-------------------------------------------------------------------------------Create new user in DB
    async function insertUser(){
        let postu = {
            provider: "native",
            username: data.name,
            email: data.email,
            encryptpass: encryptedpass,
            ivString: ivString,
            picture: userImagepath};
        let sqlu = 'INSERT INTO tbluser SET ?';
        let userinput = await query(sqlu, postu);
        return userinput; 
    }

    async function getLatestUserId(){
        let insertUserResult = await insertUser();
        console.log('insertUserResult is',insertUserResult);
        let latestUserId = insertUserResult.insertId;
        console.log("Latest inserted user ID is:", latestUserId);
        return latestUserId;
    }

    async function getUserRawAttribute(){
        let userId = await getLatestUserId();
        console.log("Latest user ID is:", userId);
        let sqlUserAttri = 
        `SELECT id, provider, username, email, encryptpass, substr(picture,7) AS picture FROM stylish.tbluser WHERE id =${userId}`;
        let userAttribute = await query(sqlUserAttri);
        console.log("User attributes are:", userAttribute);
        return userAttribute;
    }

    async function createUserObject(){
        let userRawAttri = await getUserRawAttribute();
        console.log('user Raw Attri is', userRawAttri);
        let userObject = {};
        userObject['id']= userRawAttri[0]["id"];
        userObject['provider']= userRawAttri[0]["provider"];
        userObject['name']= userRawAttri[0]["username"];
        userObject['email']= userRawAttri[0]["email"];
        userObject['picture']= 'http://3.138.56.214'+userRawAttri[0]["picture"];
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
        
        // res.cookie('TokenForAccess',accessToken); //send token in the cookie
        console.log("finalObject from signUp api is:", finalObject);
        // res.header(accessToken);
        // res.send(finalObject);
        res.json(finalObject);
        
        // res.send(finalObject.data.access_token);
    }

    createUserObject();
});

router.get('/', (req, res, next)=> {
    res.send("successfully post!");
})

module.exports = router; 