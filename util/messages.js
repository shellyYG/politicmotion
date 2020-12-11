const moment = require('moment');
const users = [];

function formatMessage(username, text){
    return{
        username,
        text,
        time: moment().format('h:mm a') //am
    }
}

// ----------------------------------------------------Join user to chat
function userJoin(id, username, room){
    const user = { id, username, room };
    users.push(user);
    console.log("userJoin func output is: ", user);
    return user;
}

// ----------------------------------------------------Get current user
function getCurrentUser(id) {
    console.log("current userId is: ", id);
    // console.log("Inside user.id is", user.id); //cant have this line because user does not exist! only in users.find(user-> will user exist as one of the elements of users)
    return users.find(user => user.id === id);
}

// ----------------------------------------------------User leaves chat
function userLeave(id){
    const index = users.findIndex(user => user.id === id);
    if(index !== -1){ 
        return users.splice(index, 1)[0]; //taking out one user
    }
}

// ----------------------------------------------------Get room users
function getRoomUsers(room){
    return users.filter(user => user.room === room);
}

module.exports = {
    formatMessage,
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers};