require("dotenv").config();
const crypto = require("crypto");
const jwt = require("jsonwebtoken"); //create json web token
const signUpModel = require("../../models/user/signUpModel");
const { generateAccessToken } = require("../../../util/util");

const signUp = async (req, res) => {    
    const data = req.body;
    
    //-----encrypt password
    crypto.randomBytes(16, (err, buf)=> {});
    let iv = crypto.randomBytes(16); //different everytime
  
    //-----get the ivString
    let ivString = iv.toString("base64");
    
    let signature = data.signature;
    let password = data.password;
    let key = process.env.ACCESS_TOKEN_KEY; 
    let cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encryptedpass = cipher.update(password, "utf-8","hex"); 
    encryptedpass += cipher.final("hex"); 
    
    //-----decrypt password
    let decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decryptedpass = decipher.update(encryptedpass, "hex", "utf-8");
    decryptedpass += decipher.final("utf-8");
    
    async function checkExist(){
        const existingUsers = await signUpModel.checkNameExist(data);
        const existingEmails = await signUpModel.checkEmailExist(data);
        if(existingUsers.length > 0){
            res.send("username already existed!");
        }else if(existingEmails.length>0){
            res.send("email already existed!");
        }else{
            async function createUserObject(){
                let userRawAttri = await signUpModel.getUserRawAttribute(data, encryptedpass, ivString, signature);
                let userObject = {};
                userObject["id"]= userRawAttri[0]["id"];
                userObject["provider"]= userRawAttri[0]["provider"];
                userObject["name"]= userRawAttri[0]["username"];
                userObject["email"]= userRawAttri[0]["email"];
                
                let finalObject = {};
                let dataObject = {};
                dataObject["user"] = userObject;
                finalObject["data"] = dataObject;

                let payloadObject = {};
                payloadObject["data"]= userObject;
                
                //-----------Create token
                const payload = payloadObject;
                const accessToken = generateAccessToken(payload); //get access token
                
                dataObject["access_token"] = accessToken;

                // Verify token to get lifetime for token
                jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
                    if (err) return res.send("You are too long away. Please sign in again.");
                    else {
                        console.log("Payload is",payload);
                        dataObject["access_expired"] = payload.exp-payload.iat; 
                    }
                });
                res.json(finalObject);
            }
            createUserObject();
        }
    }
    checkExist();
};

module.exports = {
    signUp
}; 