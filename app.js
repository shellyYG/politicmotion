require('dotenv').config()
const PORT = process.env.PORT || 3000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// const path = require('path'); // for socket io

const NYTWebDataRoutes = require('./routes/getNews/getNYTData');
const segmentTopicRoutes = require('./routes/getNews/segmentTopic');
const searchRoutes = require('./routes/searchNews/searchBack');
const showNewsRoutes = require('./routes/getNews/showNews');
const showNewsContentRoutes = require('./routes/analyzeNews/showNewsContentBack');
const analyzeUserEmotion = require('./routes/analyzeUsers/userEmotionBack');
const signUpRoutes = require('./routes/user/signUp');
const signInRoutes = require('./routes/user/signIn');
const findBuddiesRoutes = require('./routes/user/findBuddies');
const findOppositesRoutes = require('./routes/user/findOpposites');

app.use('/NYTimesWeb', NYTWebDataRoutes);
app.use('/segmentTopic', segmentTopicRoutes);
app.use('/searchNews', searchRoutes);
app.use('/showNews', showNewsRoutes);
app.use('/showNewsContent', showNewsContentRoutes);
app.use('/calUserEmotion', analyzeUserEmotion);
app.use('/user/signup', signUpRoutes);
app.use('/user/signin', signInRoutes);
app.use('/findBuddies', findBuddiesRoutes);
app.use('/findOpposites', findOppositesRoutes);


const server = require("http").createServer(app);
const io = require("socket.io")(server);

const socketChat = require("./routes/user/chatBack");
io.on('connection', socketChat);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// const { socketCon } = require("./routes/user/chatBack");
// socketCon(io);

server.listen(PORT, PORT,()=>{
    console.log(`Socket listening on port ${PORT}...`);
})