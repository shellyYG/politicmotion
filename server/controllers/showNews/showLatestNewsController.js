const showLatestNewsModel = require("../../models/showNews/showLatestNewsModel");

const showLatestNews = async (req, res) => {
    const finalNewsPackage = [];
    async function getLatestNewsContent() {
        let allNews = await showLatestNewsModel.getLatestNews();
        for (let i=0; i<allNews.length; i++){
            var singleNews = {};
            singleNews.id = allNews[i].id;
            singleNews.content = allNews[i].content;
            singleNews.post_date = allNews[i].post_date;
            singleNews.post_link = allNews[i].post_link;
            singleNews.reaction = allNews[i].reaction;
            singleNews.sentiment_score = allNews[i].sentiment_score;
            singleNews.magnitude_score = allNews[i].magnitude_score;
            singleNews.user_sentiment_score = allNews[i].user_sentiment_score;
            singleNews.user_magnitude_score = allNews[i].user_magnitude_score;
            singleNews.post_source = allNews[i].post_source;
            singleNews.title = allNews[i].title;
            singleNews.small_title = allNews[i].small_title;
            singleNews.lead_paragraph = allNews[i].lead_paragraph;
            singleNews.paragraph = allNews[i].paragraph;

            singleNews.clickedId = '';
            singleNews.matchedId = '';
            finalNewsPackage.push(singleNews);
        }
        res.json(finalNewsPackage);
    }
    getLatestNewsContent();
};

module.exports = {
    showLatestNews
};