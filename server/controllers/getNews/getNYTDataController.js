require("dotenv").config();
const axios = require("axios");
const NYTimesToken = process.env.NYTimeToken;
const getNYTDataModel = require("../../models/getNews/getNYTDataModel");

let link = `https://api.nytimes.com/svc/mostpopular/v2/shared/1/facebook.json?api-key=${NYTimesToken}`; //get last 1 day data from facebook
async function getNYTimesWebData(){
    console.log("start getNYTData");
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
                singleNews.push(newsid, url, source, published_date, title, abstract, topics, saved_date);
                
                // build allNews array
                allNews.push(singleNews);
            }

            await getNYTDataModel.addNYTNews(allNews);
        }
        
        
        // ---------------------------------------------------------------------- start saving to news (details) table

        await saveData();

        let allDetails = [];
        async function matchLeadParagraph(){
            let titles = await getNYTDataModel.getLeadParagraph();
            console.log("titles.length: ", titles.length);
            
            for (i=0; i<titles.length; i++){
                try{
                    var encodedComponent = encodeURIComponent(titles[i].title);
                    var detailLink = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q="${encodedComponent}"&api-key=${NYTimesToken}`;
                    let NYTresponse = await axios.get(detailLink);
                    var leadParagraph = NYTresponse.data.response.docs[0].lead_paragraph;
                    var abstract = NYTresponse.data.response.docs[0].abstract;
                    var headline = NYTresponse.data.response.docs[0].headline.main;
                    var savedDetailedDate = new Date();
                    var singleDetails = [];
                    
                    singleDetails.push(headline, abstract, leadParagraph, savedDetailedDate);
                    
                    // build allNews array
                    allDetails.push(singleDetails);
                }catch(err){
                    allDetails;
                }
            }

            console.log("allDetails.length: ", allDetails.length);

            try {
                await getNYTDataModel.addNYTDetails(allDetails);
            }catch(err){
                console.log("Not a single lead-paragraph to insert.");
            }
            
        }

        await matchLeadParagraph();
        console.log("Done getNYTDataController");

    }catch(err){
        console.log("Can't get NYT Web data!, err is: ", err);
    }
}
getNYTimesWebData();

// kill the process after 90 sec
setTimeout((function() {
    return process.kill(process.pid);
}), 150000);