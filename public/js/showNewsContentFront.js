let articles = document.querySelector('#articles');
let articleElements = document.querySelectorAll('article');
const searchTopic1 = localStorage.getItem("searchTopic1");
const searchTopic2 = localStorage.getItem("searchTopic2");
var finalPointsClicked = localStorage.getItem("clickedPoints");
let avgPostSentiment = 0;
let avgPostMagnitude = 0;
let avgReactionSentiment = 0;
let avgReactionMagnitude = 0;

// NYTimes Emotions
let avgNYTPostSentiment = 0;
let avgNYTPostMagnitude = 0;
let avgNYTReactionSentiment = 0;
let avgNYTReactionMagnitude = 0;
let NYTlength = 0;

// Fox Emotions
let avgFoxPostSentiment = 0;
let avgFoxPostMagnitude = 0;
let avgFoxReactionSentiment = 0;
let avgFoxReactionMagnitude = 0;
let FoxLength = 0;

if (articleElements.length == 0){
    // console.log(articleElements.length);
    console.log("Give-me-those-news clicked. No articles yet.");
}else{
    for (i=0; i<articleElements.length;i++){
        articles.removeChild(articleElements[i]);
    }
    console.log("Give-me-those-news clicked. Removed old articles!");
}

axios.post(`showNewsContent`,{
    'searchTopic1': searchTopic1,
    'searchTopic2': searchTopic2,
    'clickedIds': finalPointsClicked
}).then(res=>{
        var articleBlock;
        for (i=0; i<res.data.length; i++){
            // ============================================================= Get clicked Articles and create a block
            if (res.data[i].clickedId !== 0){

                var articleDBId = res.data[i].id;
                articleBlock = document.createElement('articleBlock');
                articleBlock.setAttribute("id", `articleBlock_${articleDBId}`);
                articleBlock.setAttribute("class", "row container");
                console.log("i: ", i, "articleBlock: ", articleBlock);

                var article = document.createElement('article-clicked');
                article.setAttribute("id", `article_${articleDBId}`);
                article.setAttribute("class", "col-md-6 item");

                var articleId = document.createElement('articleId');
                articleId.setAttribute("id", `articleId_${articleDBId}`);

                var articleDate = document.createElement('articleDate');
                articleDate.setAttribute("id", `articleDate_${articleDBId}`);

                var articleContent = document.createElement('articleContent');
                articleContent.setAttribute("id", `articleContent_${articleDBId}`);

                var articleLink = document.createElement('articleLink');
                articleLink.setAttribute("id", `articleLink_${articleDBId}`);

                var br = document.createElement("br");

                var loveBtn = document.createElement("button");
                loveBtn.innerHTML = "Love";
                loveBtn.setAttribute("id", `user_loveBtn_${articleDBId}`);

                var angryBtn = document.createElement("button");
                angryBtn.innerHTML = "Angry";
                angryBtn.setAttribute("id", `user_angryBtn_${articleDBId}`);

                var cryBtn = document.createElement("button");
                cryBtn.innerHTML = "Cry";
                cryBtn.setAttribute("id", `user_cryBtn_${articleDBId}`);

                var hahaBtn = document.createElement("button");
                hahaBtn.innerHTML = "Haha";
                hahaBtn.setAttribute("id", `user_hahaBtn_${articleDBId}`);

                articleId.textContent = res.data[i].id;
                articleDate.textContent = res.data[i].post_date;
                articleContent.textContent = res.data[i].content;
                articleLink.textContent = res.data[i].post_link;

                // ===================================calculate average post emotion
                avgPostSentiment += res.data[i].sentiment_score;
                avgPostMagnitude += res.data[i].magnitude_score;
                // ===================================calculate average FB user reaction 
                avgReactionSentiment += res.data[i].user_sentiment_score;
                avgReactionMagnitude += res.data[i].user_magnitude_score;
    
                // -------cal average New York Time post emotion
                if(res.data[i].post_source=="nytimes"){
                    avgNYTPostSentiment += res.data[i].sentiment_score;
                    avgNYTPostMagnitude += res.data[i].magnitude_score;
                    avgNYTReactionSentiment += res.data[i].user_sentiment_score;
                    avgNYTReactionMagnitude += res.data[i].user_magnitude_score;
                    NYTlength += 1;
                }
                // -------cal average Fox post emotion
                if(res.data[i].post_source=="foxnews"){
                    avgFoxPostSentiment += res.data[i].sentiment_score;
                    avgFoxPostMagnitude += res.data[i].magnitude_score;
                    avgFoxReactionSentiment += res.data[i].user_sentiment_score;
                    avgFoxReactionMagnitude += res.data[i].user_magnitude_score;
                    FoxLength += 1;
                }

                // append single article
                article.appendChild(articleId);
                article.appendChild(articleDate);
                article.appendChild(articleContent);
                article.appendChild(articleLink);
                article.appendChild(br); //not readable, why?? here
                article.appendChild(loveBtn);
                article.appendChild(angryBtn);
                article.appendChild(cryBtn);
                article.appendChild(hahaBtn);

                articleBlock.appendChild(article)

                articles.appendChild(articleBlock); // append to all articles list
                // localStorage.removeItem("clickedPoints"); // remove local storage items

            }
        }

        for (i=0; i<res.data.length; i++){
            var matchedArticleBlock;
            // ============================================================= Get matched Articles in same block
            for (j=0;j<res.data.length;j++){
                if (res.data[i].clickedId == 0){ //is a matched article
                    if (res.data[j].matchedId == res.data[i].id){ // if a clickedArticle's matched Article == this matched article
                        matchedArticleBlock = document.getElementById(`articleBlock_${res.data[j].id}`);
                        articleDBId = res.data[i].id;
                        var article = document.createElement('article-matched');
                        article.setAttribute("id", `article_${articleDBId}`);
                        article.setAttribute("class", "col-md-6 item");

                        var articleId = document.createElement('articleId');
                        articleId.setAttribute("id", `articleId_${articleDBId}`);

                        var articleDate = document.createElement('articleDate');
                        articleDate.setAttribute("id", `articleDate_${articleDBId}`);

                        var articleContent = document.createElement('articleContent');
                        articleContent.setAttribute("id", `articleContent_${articleDBId}`);

                        var articleLink = document.createElement('articleLink');
                        articleLink.setAttribute("id", `articleLink_${articleDBId}`);

                        var br = document.createElement("br");

                        var loveBtn = document.createElement("button");
                        loveBtn.innerHTML = "Love";
                        loveBtn.setAttribute("id", `user_loveBtn_${articleDBId}`);

                        var angryBtn = document.createElement("button");
                        angryBtn.innerHTML = "Angry";
                        angryBtn.setAttribute("id", `user_angryBtn_${articleDBId}`);

                        var cryBtn = document.createElement("button");
                        cryBtn.innerHTML = "Cry";
                        cryBtn.setAttribute("id", `user_cryBtn_${articleDBId}`);

                        var hahaBtn = document.createElement("button");
                        hahaBtn.innerHTML = "Haha";
                        hahaBtn.setAttribute("id", `user_hahaBtn_${articleDBId}`);

                        articleId.textContent = res.data[i].id;
                        articleDate.textContent = res.data[i].post_date;
                        articleContent.textContent = res.data[i].content;
                        articleLink.textContent = res.data[i].post_link;

                        // ===================================calculate average post emotion
                        avgPostSentiment += res.data[i].sentiment_score;
                        avgPostMagnitude += res.data[i].magnitude_score;
                        // ===================================calculate average FB user reaction 
                        avgReactionSentiment += res.data[i].user_sentiment_score;
                        avgReactionMagnitude += res.data[i].user_magnitude_score;
            
                        // -------cal average New York Time post emotion
                        if(res.data[i].post_source=="nytimes"){
                            avgNYTPostSentiment += res.data[i].sentiment_score;
                            avgNYTPostMagnitude += res.data[i].magnitude_score;
                            avgNYTReactionSentiment += res.data[i].user_sentiment_score;
                            avgNYTReactionMagnitude += res.data[i].user_magnitude_score;
                            NYTlength += 1;
                        }
                        // -------cal average Fox post emotion
                        if(res.data[i].post_source=="foxnews"){
                            avgFoxPostSentiment += res.data[i].sentiment_score;
                            avgFoxPostMagnitude += res.data[i].magnitude_score;
                            avgFoxReactionSentiment += res.data[i].user_sentiment_score;
                            avgFoxReactionMagnitude += res.data[i].user_magnitude_score;
                            FoxLength += 1;
                        }

                        // append single article
                        article.appendChild(articleId);
                        article.appendChild(articleDate);
                        article.appendChild(articleContent);
                        article.appendChild(articleLink);
                        article.appendChild(br); //not readable, why?? here
                        article.appendChild(loveBtn);
                        article.appendChild(angryBtn);
                        article.appendChild(cryBtn);
                        article.appendChild(hahaBtn);

                        matchedArticleBlock.appendChild(article)

                        articles.appendChild(matchedArticleBlock); // append to all articles list
                        localStorage.removeItem("clickedPoints"); // remove local storage items
                    }

                }
            }
        }
        var userEmotionButtons = document.querySelectorAll('[id^="user_"]');
            
        for (let j = 0; j < userEmotionButtons.length; j++) {
            let userEmotionButton = userEmotionButtons[j];
            let userEmotionId = userEmotionButton.getAttribute('id');

            userEmotionButton.addEventListener('click',()=>{
                var emotionClicked = localStorage.getItem("clickedEmotions");
                var emotionArray = [];
                if(emotionClicked){
                    emotionArray = JSON.parse(emotionClicked);
                }
                emotionArray.push(userEmotionId);
                localStorage.setItem('clickedEmotions',JSON.stringify(emotionArray));  
                finalEmotionClicked = localStorage.getItem("clickedEmotions");
                
            })
        }
        avgPostSentiment = avgPostSentiment/res.data.length;
        avgPostMagnitude = avgPostMagnitude/res.data.length;
        avgPostSentiment = avgPostSentiment.toFixed(2);
        avgPostMagnitude = avgPostMagnitude.toFixed(2);

        avgReactionSentiment = avgReactionSentiment/res.data.length;
        avgReactionMagnitude = avgReactionMagnitude/res.data.length;
        avgReactionSentiment = avgReactionSentiment.toFixed(2);
        avgReactionMagnitude = avgReactionMagnitude.toFixed(2);

        // by news source
        avgNYTPostSentiment = avgNYTPostSentiment/NYTlength;
        avgNYTPostMagnitude = avgNYTPostMagnitude/NYTlength;
        avgNYTReactionSentiment = avgNYTReactionSentiment/NYTlength;
        avgNYTReactionMagnitude = avgNYTReactionMagnitude/NYTlength;
        avgFoxPostSentiment = avgFoxPostSentiment/FoxLength;
        avgFoxPostMagnitude = avgFoxPostMagnitude/FoxLength;
        avgFoxReactionSentiment = avgFoxReactionSentiment/FoxLength;
        avgFoxReactionMagnitude = avgFoxReactionMagnitude/FoxLength;

        avgNYTPostSentiment = avgNYTPostSentiment.toFixed(2);
        avgNYTPostMagnitude = avgNYTPostMagnitude.toFixed(2);
        avgNYTReactionSentiment = avgNYTReactionSentiment.toFixed(2);
        avgNYTReactionMagnitude = avgNYTReactionMagnitude.toFixed(2);
        avgFoxPostSentiment = avgFoxPostSentiment.toFixed(2);
        avgFoxPostMagnitude = avgFoxPostMagnitude.toFixed(2);
        avgFoxReactionSentiment = avgFoxReactionSentiment.toFixed(2);
        avgFoxReactionMagnitude = avgFoxReactionMagnitude.toFixed(2);

        localStorage.setItem("avgPostSentiment",avgPostSentiment);
        localStorage.setItem("avgPostMagnitude",avgPostMagnitude);
        localStorage.setItem("avgReactionSentiment", avgReactionSentiment);
        localStorage.setItem("avgReactionMagnitude", avgReactionMagnitude);

        localStorage.setItem("avgNYTPostSentiment", avgNYTPostSentiment);
        localStorage.setItem("avgNYTPostMagnitude", avgNYTPostMagnitude);
        localStorage.setItem("avgNYTReactionSentiment", avgNYTReactionSentiment);
        localStorage.setItem("avgNYTReactionMagnitude", avgNYTReactionMagnitude);
        localStorage.setItem("avgFoxPostSentiment", avgFoxPostSentiment);
        localStorage.setItem("avgFoxPostMagnitude", avgFoxPostMagnitude);
        localStorage.setItem("avgFoxReactionSentiment", avgFoxReactionSentiment);
        localStorage.setItem("avgFoxReactionMagnitude", avgFoxReactionMagnitude);
        
        const analyzeUserEmotionButton = document.getElementById('btn-analyzeUser');
        analyzeUserEmotionButton.addEventListener('click',()=>{
            window.location.href = '/userEmotion.html';
        })
}).catch(err => {
    console.log("err from tfidf: ",err);
}) 
