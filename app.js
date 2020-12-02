require('dotenv').config()
const PORT = process.env.PORT || 3000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const vader = require('vader-sentiment');
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());


const NYTWebDataRoutes = require('./routes/getNews/getNYTData');
const segmentTopicRoutes = require('./routes/getNews/segmentTopic');
const searchRoutes = require('./routes/searchNews/searchBack');
const showNewsRoutes = require('./routes/getNews/showNews');
const textSimilarRoutes = require('./routes/analyzeNews/tfidf');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false}));
app.use('/NYTimesWeb', NYTWebDataRoutes);
app.use('/segmentTopic', segmentTopicRoutes);
app.use('/searchNews', searchRoutes);
app.use('/showNews', showNewsRoutes);
app.use('/tfidf', textSimilarRoutes);


app.get('/', (req, res)=> {
    res.send("Hello pretty Shelly");
    
})

// function getEmotion(input) {
//     const score = vader.SentimentIntensityAnalyzer.polarity_scores(input);
//     console.log("'",input, "':", score);
// }

// const input = 'Appeals Court Rejects Trump Election Challenge in Pennsylvania';
// getEmotion(input);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});