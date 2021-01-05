require('dotenv').config()
const PORT = process.env.PORT || 3000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

const analyzeUserEmotion = require('./server/routes/user/userEmotionBack');
const signUpRoutes = require('./server/routes/user/signUp');
const signInRoutes = require('./server/routes/user/signIn');
// const findBuddiesRoutes = require('./server/controllers/user/findBuddiesController');
const contactRoutes = require('./server/routes/user/contact');

app.use([
    require('./server/routes/showNews/searchRoute'),
    require('./server/routes/showNews/showNewsContentRoute'),
    require('./server/routes/user/findBuddiesRoute')
])


app.use('/calUserEmotion', analyzeUserEmotion);
app.use('/user/signup', signUpRoutes);
app.use('/user/signin', signInRoutes);
// app.use('/findBuddies', findBuddiesRoutes);
app.use('/user/contact', contactRoutes);


const server = require("http").createServer(app);
const io = require("socket.io")(server);

const socketChat = require("./server/routes/user/chatBack");
io.on('connection', socketChat);

// Setup 404 page
app.use(function (req, res, next) {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

server.listen(PORT,()=>{
    console.log(`Socket listening on port ${PORT}...`);
})

// module.exports = server;