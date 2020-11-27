require('dotenv').config()
const PORT = process.env.PORT || 3000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const vader = require('vader-sentiment');
const axios = require('axios');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false}));



const NYTimesToken = process.env.NYTimeToken

app.get('/', (req, res)=> {
    res.send("Hello pretty Shelly");
    
})


app.get('/NYTimesWeb', (req, res)=> {
    let link = `https://api.nytimes.com/svc/mostpopular/v2/shared/1/facebook.json?api-key=${NYTimesToken}`
    async function getNYTimesWebData(){
        try {
            let NYTimeResponse = await axios.get(link);
            console.log("Successfully get NYT Web data!")
            // console.log(NYTimeResponse.data)
            res.send(NYTimeResponse.data);
            return NYTimeResponse.data;
        }catch(err){
            console.log("Can't get NYT Web data!");
        }
    }
    getNYTimesWebData();
    
    
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