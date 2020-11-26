const PORT = process.env.PORT || 3000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const vader = require('vader-sentiment');
const axios = require('axios');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}));



app.get('/', (req, res)=> {
    res.send("Hello pretty Shelly");
})

const NYTimesToken = process.env.NYTimeToken
app.get('/NYTimeWeb', (req, res)=> {
    async function getNYTimesWebData(){
        try {
            let NYTimeResponse = await axios.get(`https://api.nytimes.com/svc/mostpopular/v2/shared/1/facebook.json?api-key=${NYTimesToken}`);
            console.log("I am NYTimeResponse", NYTimeResponse);
            return NYTimeResponse;

        }catch(err){
            console.log("Can't get NYTime Web data!");
        }
    }
    let datadisplay = getNYTimesWebData();
    console.log(datadisplay);
})

function getEmotion(input) {
    const score = vader.SentimentIntensityAnalyzer.polarity_scores(input);
    console.log("'",input, "':", score);
}

const input = 'The movie was awesome.';
getEmotion(input);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});