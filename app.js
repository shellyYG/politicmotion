require('dotenv').config()
const PORT = process.env.PORT || 3000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const vader = require('vader-sentiment');


const NYTWebDataRoutes = require('./routes/getNYTData');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false}));
app.use('/NYTimesWeb', NYTWebDataRoutes);


app.get('/', (req, res)=> {
    res.send("Hello pretty Shelly");
    
})

// function getEmotion(input) {
//     const score = vader.SentimentIntensityAnalyzer.polarity_scores(input);
//     console.log("'",input, "':", score);
// }

// const input = 'The movie was awesome.';
// getEmotion(input);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});