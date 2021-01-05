const { query } = require("../query");

async function checkNameExist(data){
    let sql = `SELECT * FROM user_basic WHERE username = '${data.name}'`;
    let sqlquery = await query(sql);
    return sqlquery;
}

async function checkEmailExist(data){
    let sql = `SELECT * FROM user_basic WHERE email = '${data.email}'`;
    let sqlquery = await query(sql);
    return sqlquery;
}

async function insertUser(data, encryptedpass, ivString, signature){
    let insertedData = {
        provider: "native",
        username: data.name,
        email: data.email,
        encryptpass: encryptedpass,
        ivString: ivString,
        signature: signature
        };
    let sql = "INSERT INTO user_basic SET ?";
    let sqlquery = await query(sql, insertedData);
    return sqlquery;
}

async function getLatestUserId(data, encryptedpass, ivString, signature){
    let insertUserResult = await insertUser(data, encryptedpass, ivString, signature);
    let latestUserId = insertUserResult.insertId;
    return latestUserId;
}

async function getUserRawAttribute(data, encryptedpass, ivString, signature){
    let userId = await getLatestUserId(data, encryptedpass, ivString, signature);
    let sqlUserAttri = 
    `SELECT id, provider, username, email, encryptpass FROM politicmotion.user_basic WHERE id =${userId}`;
    let userAttribute = await query(sqlUserAttri);
    return userAttribute;
}

module.exports = {
    checkNameExist,
    checkEmailExist,
    getUserRawAttribute
};