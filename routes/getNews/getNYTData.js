const express = require('express');
const router = express.Router();
const { query } = require('../../models/query');
const axios = require('axios');
const NYTimesToken = process.env.NYTimeToken

router.get('/', (req, res)=> {
    let link = `https://api.nytimes.com/svc/mostpopular/v2/shared/1/facebook.json?api-key=${NYTimesToken}` //get last 1 day data from facebook
    async function getNYTimesWebData(){
        try {
            let NYTimeResponse = await axios.get(link);
            console.log("Successfully get NYT Web data!")
           
            let allNews = []; 
            async function saveData (){
                for (i=0; i<NYTimeResponse.data.results.length;i++){ 
                    singleNews = [];
                    let newsid=NYTimeResponse.data.results[i].id;
                    let url = NYTimeResponse.data.results[i].url;
                    let source = NYTimeResponse.data.results[i].source;
                    let published_date = NYTimeResponse.data.results[i].published_date;
                    let title = NYTimeResponse.data.results[i].title;
                    let abstract = NYTimeResponse.data.results[i].abstract;
                    let des_facet = NYTimeResponse.data.results[i].des_facet;
                    let saved_date = new Date();
                    let topics = des_facet.join("|");

                    // build single news array
                    singleNews.push(newsid);
                    singleNews.push(url);
                    singleNews.push(source);
                    singleNews.push(published_date);
                    singleNews.push(title);
                    singleNews.push(abstract);
                    singleNews.push(topics);
                    singleNews.push(saved_date);


                    // build allNews array
                    allNews.push(singleNews);
                }

                sql = 'INSERT INTO news_rawdata (news_id, post_link, news_source, published_date, title, abstract, topics, saved_date) VALUES ?'
                let sqlquery = await query(sql, [allNews]);
                return sqlquery;
            }
            
            saveData()
            
            res.send("Successfully got NYTData & saved!");
            console.log("Data successfully saved.")
            return NYTimeResponse.data;
        }catch(err){
            console.log("Can't get NYT Web data!");
        }
    }
    getNYTimesWebData();
    
})

module.exports = router;