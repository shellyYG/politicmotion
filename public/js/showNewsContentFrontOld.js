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
    console.log("No articles yet.");
}else{
    for (i=0; i<articleElements.length;i++){
        articles.removeChild(articleElements[i]);
    }
    console.log("Removed old articles!");
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
                var rawDate = res.data[i].post_date;
                var re = /([^T]+)/;
                var pureDatePart = rawDate.split(re);
                var datePart = pureDatePart[1];
                var datePartArray = datePart.split("-");
                
                var beautifyDateYear = datePartArray[0];
                var beautifyDateMonth = datePartArray[1];
                var beautifyDateDate = datePartArray[2];
                var finalBeutifiedDate = beautifyDateYear+"/"+beautifyDateMonth+"/"+beautifyDateDate;
                
                var articleDBId = res.data[i].id;

                articleBlock = document.createElement('div');
                articleBlock.setAttribute("id", `articleBlock_${articleDBId}`);
                articleBlock.setAttribute("class", "row container");

                var article = document.createElement('div');
                article.setAttribute("id", `articleClicked_${articleDBId}`);
                article.setAttribute("class", "col-md-6 item");

                var articleElementContainer = document.createElement('div');
                articleElementContainer.setAttribute("class", "row");

                var articleSource = document.createElement('div');
                articleSource.setAttribute("id",`source_${res.data[i].post_source}`);

                var articleDate = document.createElement('div');
                articleDate.setAttribute("id", `articleDate_${articleDBId}`);

                var articleContent = document.createElement('div');
                articleContent.setAttribute("id", `articleContent_${articleDBId}`);

                var articleId = document.createElement('div');
                articleId.setAttribute("id", `articleId_${articleDBId}`);

                var articleLink = document.createElement('a');
                articleLink.setAttribute("href", `${res.data[i].post_link}`);

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

                articleDate.textContent = finalBeutifiedDate;
                articleContent.textContent = res.data[i].content;
                articleId.textContent = res.data[i].id;
                articleLink.textContent = "read more";
                if (res.data[i].post_source == 'nytimes'){
                    articleSource.textContent = "New York Times";
                }else{
                    articleSource.textContent = "Fox News";
                }

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
                article.appendChild(articleSource);
                article.appendChild(articleDate);
                article.appendChild(articleContent);
                article.appendChild(articleId);
                article.appendChild(articleLink);
                article.appendChild(br); //not readable, why?? here
                article.appendChild(loveBtn);
                article.appendChild(angryBtn);
                article.appendChild(cryBtn);
                article.appendChild(hahaBtn);

                articleBlock.appendChild(article);

                const loadingSection = document.getElementById("loading");
                loadingSection.innerHTML = "";

                articles.appendChild(articleBlock); // append to all articles list

            }
        }

        for (i=0; i<res.data.length; i++){
            var matchedArticleBlock;
            // ============================================================= Get matched Articles in same block
            for (j=0;j<res.data.length;j++){
                if (res.data[i].clickedId == 0){ //is a matched article
                    if (res.data[j].matchedId == res.data[i].id){ // if a clickedArticle's matched Article == this matched article
                        var rawDate = res.data[i].post_date;
                        var re = /([^T]+)/;
                        var pureDatePart = rawDate.split(re);
                        var datePart = pureDatePart[1];
                        var datePartArray = datePart.split("-");
                        
                        var beautifyDateYear = datePartArray[0];
                        var beautifyDateMonth = datePartArray[1];
                        var beautifyDateDate = datePartArray[2];
                        var finalBeutifiedDate = beautifyDateYear+"/"+beautifyDateMonth+"/"+beautifyDateDate;

                        matchedArticleBlock = document.getElementById(`articleBlock_${res.data[j].id}`);
                        articleDBId = res.data[i].id;
                        var article = document.createElement('div');
                        article.setAttribute("id", `articleMatched_${articleDBId}`);
                        article.setAttribute("class", "col-md-6");

                        var articleSource = document.createElement('div');
                        articleSource.setAttribute("id",`source_${res.data[i].post_source}`);
                        articleSource.setAttribute("class", "col-md-6");

                        var articleDate = document.createElement('div');
                        articleDate.setAttribute("id", `articleDate_${articleDBId}`);

                        var articleContent = document.createElement('div');
                        articleContent.setAttribute("id", `articleContent_${articleDBId}`);

                        var articleId = document.createElement('div');
                        articleId.setAttribute("id", `articleId_${articleDBId}`);

                        var articleLink = document.createElement('a');
                        articleLink.setAttribute("href", `${res.data[i].post_link}`);

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

                        articleDate.textContent = finalBeutifiedDate;
                        articleContent.textContent = res.data[i].content;
                        articleId.textContent = res.data[i].id;
                        articleLink.textContent = "read more";
                        if (res.data[i].post_source == 'nytimes'){
                            articleSource.textContent = "New York Times";
                        }else{
                            articleSource.textContent = "Fox News";
                        }

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
                        
                        article.appendChild(articleSource);
                        article.appendChild(articleDate);
                        article.appendChild(articleContent);
                        article.appendChild(articleId);
                        article.appendChild(articleLink);
                        article.appendChild(br); //not readable, why?? here
                        article.appendChild(loveBtn);
                        article.appendChild(angryBtn);
                        article.appendChild(cryBtn);
                        article.appendChild(hahaBtn);

                        matchedArticleBlock.appendChild(article);

                        const loadingSection = document.getElementById("loading");
                        loadingSection.innerHTML = "";

                        articles.appendChild(matchedArticleBlock); // append to all articles list
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
