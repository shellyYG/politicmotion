require('dotenv').config()
const PORT = process.env.PORT || 3000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const vader = require('vader-sentiment');
const axios = require('axios');

const { query } = require('./models/query');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false}));



const NYTimesToken = process.env.NYTimeToken

app.get('/', (req, res)=> {
    res.send("Hello pretty Shelly");
    
})


app.get('/NYTimesWeb', (req, res)=> {
    let link = `https://api.nytimes.com/svc/mostpopular/v2/shared/1/facebook.json?api-key=${NYTimesToken}` //get last 1 day data from facebook
    async function getNYTimesWebData(){
        try {
            let NYTimeResponse = await axios.get(link);
            console.log("Successfully get NYT Web data!")
            // console.log(NYTimeResponse.data)
            res.send(NYTimeResponse.data.results[0]);
           

            async function saveData (){
                for (i=0; i<2;i++){ //NYTimeResponse.data.results.length
                    let newsid=NYTimeResponse.data.results[i].id;
                    let url = NYTimeResponse.data.results[i].url;
                    let source = NYTimeResponse.data.results[i].source;
                    let published_date = NYTimeResponse.data.results[i].published_date;
                    let title = NYTimeResponse.data.results[i].title;
                    let abstract = NYTimeResponse.data.results[i].abstract;
                    let des_facet = NYTimeResponse.data.results[i].des_facet;

                }
                

                let topics = des_facet.join("|")
                
                let post={
                    news_id: newsid,
                    news_source: source,
                    post_link: url,
                    published_date: published_date,
                    title: title,
                    abstract: abstract,
                    topics: topics
                }

                sql = 'INSERT INTO news_rawdata SET ?'
                let sqlquery = await query(sql, post);
                return sqlquery;
            }
            
            saveData()



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