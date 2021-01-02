require('dotenv').config()
const PORT = process.env.PORT || 3000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

const searchRoutes = require('./routes/showNews/searchBack');
const showNewsContentRoutes = require('./routes/showNews/showNewsContentBack');
const analyzeUserEmotion = require('./routes/user/userEmotionBack');
const signUpRoutes = require('./routes/user/signUp');
const signInRoutes = require('./routes/user/signIn');
const findBuddiesRoutes = require('./routes/user/findBuddies');
const contactRoutes = require('./routes/user/contact');

app.use('/searchNews', searchRoutes);
app.use('/showNewsContent', showNewsContentRoutes);
app.use('/calUserEmotion', analyzeUserEmotion);
app.use('/user/signup', signUpRoutes);
app.use('/user/signin', signInRoutes);
app.use('/findBuddies', findBuddiesRoutes);
app.use('/user/contact', contactRoutes);


const server = require("http").createServer(app);
const io = require("socket.io")(server);

const socketChat = require("./routes/user/chatBack");
io.on('connection', socketChat);

// Setup 404 page
app.use(function (req, res, next) {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

server.listen(PORT,()=>{
    console.log(`Socket listening on port ${PORT}...`);
})