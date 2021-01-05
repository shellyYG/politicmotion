require("dotenv").config();
const crypto = require("crypto");
const signInModel = require("../../models/user/signInModel");
const { generateAccessToken } = require("../../../util/util");

const signIn = async (req, res) => { 
    const data = req.body;

    async function getLogInUserPass(){
        let LoginUserResult = await signInModel.insertLoginUser(req);
        let LoginUserResultivString = LoginUserResult[0]["ivString"];
        let password = data.password;
        let key = process.env.ACCESS_TOKEN_KEY;
        let ivBack = Buffer.from(LoginUserResultivString, "base64");
        let cipher = crypto.createCipheriv("aes-256-cbc", key, ivBack);
        let encryptedLoginPass = cipher.update(password, "utf-8","hex"); //Input: utf-8, Output: hex
        encryptedLoginPass += cipher.final("hex");

        let decipher = crypto.createDecipheriv("aes-256-cbc", key, ivBack);
        let decryptedLoginpass = decipher.update(encryptedLoginPass, "hex", "utf-8");

        decryptedLoginpass += decipher.final("utf-8");
        return encryptedLoginPass;
    }

    async function comparepass(){
        let LoginUserResult = await signInModel.insertLoginUser(req);
        console.log("LoginUserResult: ", LoginUserResult);
        if(LoginUserResult.length == 0){
            res.send("Email not existed.");
        }else{
            let DataBasePass = LoginUserResult[0]["encryptpass"];
            let userPass = await getLogInUserPass();
            
            if (userPass == DataBasePass) {
                let userObject = {};
                userObject["id"]= LoginUserResult[0]["id"];
                userObject["provider"]= LoginUserResult[0]["provider"];
                userObject["name"]= LoginUserResult[0]["username"];
                userObject["email"]= LoginUserResult[0]["email"];
                
                let finalObject = {};
                let dataObject = {};
                
                dataObject["user"] = userObject;
                finalObject["data"] = dataObject;
                
                let payloadObject = {};
                payloadObject["data"]= userObject;
                
                //------Create token
                const payload = payloadObject;
                const accessToken = generateAccessToken(payload); //get access token

                dataObject["access_token"] = accessToken;
                dataObject["access_expired"] = 30;
                res.send(finalObject);
            
            } else {
                res.send("Wrong password!");
            }
        }
    }
    comparepass();
};

module.exports = {
    signIn
}; 