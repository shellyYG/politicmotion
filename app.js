require('dotenv').config()
const PORT = process.env.PORT || 3000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());


const NYTWebDataRoutes = require('./routes/getNews/getNYTData');
const segmentTopicRoutes = require('./routes/getNews/segmentTopic');
const searchRoutes = require('./routes/searchNews/searchBack');
const showNewsRoutes = require('./routes/getNews/showNews');
const showNewsContentRoutes = require('./routes/analyzeNews/showNewsContentBack');
const analyzeUserEmotion = require('./routes/analyzeUsers/userEmotionBack');
const signUpRoutes = require('./routes/user/signUp');
const signInRoutes = require('./routes/user/signIn');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false}));
app.use('/NYTimesWeb', NYTWebDataRoutes);
app.use('/segmentTopic', segmentTopicRoutes);
app.use('/searchNews', searchRoutes);
app.use('/showNews', showNewsRoutes);
app.use('/showNewsContent', showNewsContentRoutes);
app.use('/calUserEmotion', analyzeUserEmotion);
app.use('/user/signup', signUpRoutes);
app.use('/user/signin', signInRoutes);


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});