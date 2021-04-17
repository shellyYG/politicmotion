require('dotenv').config()
const PORT = process.env.PORT || 3000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use([
    require('./server/routes/showNews/searchRoute'),
    require('./server/routes/showNews/showNewsContentRoute'),
    require('./server/routes/showNews/showLatestNewsRoute'),
    require('./server/routes/user/findBuddiesRoute'),
    require('./server/routes/user/userEmotionRoute'),
    require('./server/routes/user/signUpRoute'),
    require('./server/routes/user/signInRoute'),
    require('./server/routes/user/contactRoute'),
])

// socket.IO for chat room
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const socketChat = require("./server/controllers/user/chatController");
io.on('connection', socketChat);

// Setup 404 page
app.use(function (req, res, next) {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

server.listen(PORT,()=>{
    console.log(`Socket listening on port ${PORT}...`);
})

// module.exports = server; //for mocha test