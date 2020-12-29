const express = require("express");
const router = express.Router();
const { query } = require("../../models/query");
const axios = require("axios");
const NYTimesToken = process.env.NYTimeToken;

router.get("/", (req, res)=> {
    let link = `https://api.nytimes.com/svc/mostpopular/v2/shared/1/facebook.json?api-key=${NYTimesToken}`; //get last 1 day data from facebook
    async function getNYTimesWebData(){
        try {
            let NYTimeResponse = await axios.get(link);
            console.log("Successfully get NYT Web data!");

            // ---------------------------------------------------------------------- start saving to news (general) table
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

                sql = "INSERT INTO news_rawdata (news_id, post_link, news_source, published_date, title, abstract, topics, saved_date) VALUES ?";
                let sqlquery = await query(sql, [allNews]);
                return sqlquery;
            }
            
            
            // ---------------------------------------------------------------------- start saving to news (details) table

            async function getLeadParagraph(){
                let saveNewNews = await saveData();
                saveNewNews;
                sql = `SELECT n.title
                FROM politicmotion.news_rawdata n
                LEFT JOIN politicmotion.nyt_details d ON n.title = d.headline
                WHERE n.news_source = "New York Times" AND d.headline IS NULL
                ORDER BY n.id DESC;`;
                let sqlquery = await query(sql);
                return sqlquery;
            }

            let allDetails = [];
            async function matchLeadParagraph(){
                let titles = await getLeadParagraph();
                
                for (i=0; i<titles.length; i++){
                    console.log("i:",i);
                    try{
                        var encodedComponent = encodeURIComponent(titles[i].title);
                        var detailLink = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q="${encodedComponent}"&api-key=${NYTimesToken}`;
                        let NYTresponse = await axios.get(detailLink);
                        var leadParagraph = NYTresponse.data.response.docs[0].lead_paragraph;
                        var abstract = NYTresponse.data.response.docs[0].abstract;
                        var headline = NYTresponse.data.response.docs[0].headline.main;
                        var savedDetailedDate = new Date();
                        var singleDetails = [];
                        
                        singleDetails.push(headline);
                        singleDetails.push(abstract);
                        singleDetails.push(leadParagraph);
                        singleDetails.push(savedDetailedDate);
                        
                        // build allNews array
                        allDetails.push(singleDetails);
                    }catch(err){
                        console.log("sorry, no lead paragraph found");
                    }
                }

                try {
                    sql = "INSERT INTO nyt_details (headline, abstract, lead_paragraph, saved_date) VALUES ?";
                    let sqlquery = await query(sql, [allDetails]);
                    console.log("done inserting lead-paragraph");
                    return sqlquery;
                }catch(err){
                    console.log("Not a single lead-paragraph to insert.");
                }
                
            }

            matchLeadParagraph();
            
            res.send("Successfully got NYTData & saved!");
            console.log("Data successfully saved.");
            return NYTimeResponse.data;
        }catch(err){
            console.log("Can't get NYT Web data!");
        }
    }
    getNYTimesWebData();
    
});

module.exports = router;