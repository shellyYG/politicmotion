const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const vader = require('vader-sentiment');


function getEmotion(input) {
    const score = vader.SentimentIntensityAnalyzer.polarity_scores(input);
    console.log("'",input, "':", score);
}

const input = 'The movie was awesome.';
getEmotion(input);

const input2 = 'I am happy!';
getEmotion(input2);

const input3 = 'I am so happy!';
getEmotion(input3);

const input32 = 'I am so so so happy!';
getEmotion(input32);

const input4 = 'Its terrible';
getEmotion(input4);


app.use(express.static('public'));

app.get('/', (req, res)=> {
    res.send("Hello pretty Shelly");
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});