let articles = document.querySelector('#articles');
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



axios.post(`showNewsContent`,{
    'searchTopic1': searchTopic1,
    'searchTopic2': searchTopic2,
    'clickedIds': finalPointsClicked
}).then(res=>{
        var articleRow;
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

                articleRow = document.createElement('div');
                articleRow.setAttribute("id", `articleRow_${articleDBId}`);
                articleRow.setAttribute("class", "row");

                articleCol = document.createElement('div');
                articleCol.setAttribute("class", "col-lg-6 col-sm-6 mb-4");
                articleRow.appendChild(articleCol);

                cardShadow = document.createElement('article');
                cardShadow.setAttribute("class", "card shadow");
                cardShadow.setAttribute("id", "selectedNews_");
                articleCol.appendChild(cardShadow);

                articleBody = document.createElement('div');
                articleBody.setAttribute("class", "card-body");
                cardShadow.appendChild(articleBody);

                var articleSource = document.createElement('h4');
                articleSource.setAttribute("class","card-title");
                articleSource.setAttribute("id",`selectedNewsSrc_${res.data[i].post_source}`);

                var articleDate = document.createElement('h5');
                articleDate.setAttribute("class", `card-title`);
                articleDate.setAttribute("id", `selectedNewsDate_${articleDBId}`);

                var articleContent = document.createElement('p');
                articleContent.setAttribute("class", "cars-text");
                articleContent.setAttribute("id", `selectedNewsContent_${articleDBId}`);

                var articleLink = document.createElement('a');
                articleLink.setAttribute("class", `btn btn-xs btn-primary`);
                articleLink.setAttribute("href", `${res.data[i].post_link}`);

                var iconDiv = document.createElement('div');
                iconDiv.setAttribute("id", "icons");


                var loveBtn = document.createElement("img");
                loveBtn.setAttribute("id", `user_love_${articleDBId}`);
                loveBtn.setAttribute("src", "imgs/iconx/love.png");

                var hahaBtn = document.createElement("img");
                hahaBtn.setAttribute("id", `user_haha_${articleDBId}`);
                hahaBtn.setAttribute("src", "imgs/iconx/haha.png");

                var cryBtn = document.createElement("img");
                cryBtn.setAttribute("id", `user_sad_${articleDBId}`);
                cryBtn.setAttribute("src", "imgs/iconx/sad.png");

                var angryBtn = document.createElement("img");
                angryBtn.setAttribute("id", `user_angry_${articleDBId}`);
                angryBtn.setAttribute("src", "imgs/iconx/angry.png");


                articleDate.textContent = finalBeutifiedDate;
                articleContent.textContent = res.data[i].content;
                
                articleLink.textContent = "Read More";
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
                articleBody.appendChild(articleSource);
                articleBody.appendChild(articleDate);
                articleBody.appendChild(articleContent);
                articleBody.appendChild(articleLink);
                articleBody.appendChild(iconDiv);
                
                iconDiv.appendChild(loveBtn);
                iconDiv.appendChild(hahaBtn);
                iconDiv.appendChild(cryBtn);
                iconDiv.appendChild(angryBtn);

                articles.appendChild(articleRow); // append to all articles list

            }
        }

        for (i=0; i<res.data.length; i++){
            var matchedArticleRow;
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

                        matchedArticleRow = document.getElementById(`articleRow_${res.data[j].id}`);
                        
                        articleDBId = res.data[i].id;

                        articleCol = document.createElement('div');
                        articleCol.setAttribute("class", "col-lg-6 col-sm-6 mb-4");
                        matchedArticleRow.appendChild(articleCol);

                        cardShadow = document.createElement('article');
                        cardShadow.setAttribute("class", "card shadow");
                        cardShadow.setAttribute("id", "selectedNews");
                        articleCol.appendChild(cardShadow);

                        articleBody = document.createElement('div');
                        articleBody.setAttribute("class", "card-body");
                        cardShadow.appendChild(articleBody);

                        var articleSource = document.createElement('h4');
                        articleSource.setAttribute("class","card-title");
                        articleSource.setAttribute("id",`matchedNewsSrc_${res.data[i].post_source}`);

                        var articleDate = document.createElement('h5');
                        articleDate.setAttribute("class", `card-title`);
                        articleDate.setAttribute("id", `matchedNewsDate_${articleDBId}`);

                        var articleContent = document.createElement('p');
                        articleContent.setAttribute("class", "cars-text");
                        articleContent.setAttribute("id", `matchedNewsContent_${articleDBId}`);

                        var articleLink = document.createElement('a');
                        articleLink.setAttribute("class", `btn btn-xs btn-primary`);
                        articleLink.setAttribute("href", `${res.data[i].post_link}`);

                        var iconDiv = document.createElement('div');
                        iconDiv.setAttribute("id", "icons");

                        var loveBtn = document.createElement("img");
                        loveBtn.setAttribute("id", `user_love_${articleDBId}`);
                        loveBtn.setAttribute("src", "imgs/iconx/love.png");
        
                        var hahaBtn = document.createElement("img");
                        hahaBtn.setAttribute("id", `user_haha_${articleDBId}`);
                        hahaBtn.setAttribute("src", "imgs/iconx/haha.png");
        
                        var cryBtn = document.createElement("img");
                        cryBtn.setAttribute("id", `user_sad_${articleDBId}`);
                        cryBtn.setAttribute("src", "imgs/iconx/sad.png");
        
                        var angryBtn = document.createElement("img");
                        angryBtn.setAttribute("id", `user_angry_${articleDBId}`);
                        angryBtn.setAttribute("src", "imgs/iconx/angry.png");

                        articleDate.textContent = finalBeutifiedDate;
                        articleContent.textContent = res.data[i].content;
                        
                        articleLink.textContent = "Read More";
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
                        
                        articleBody.appendChild(articleSource);
                        articleBody.appendChild(articleDate);
                        articleBody.appendChild(articleContent);
                        articleBody.appendChild(articleLink);
                        articleBody.appendChild(iconDiv);
                
                        iconDiv.appendChild(loveBtn);
                        iconDiv.appendChild(hahaBtn);
                        iconDiv.appendChild(cryBtn);
                        iconDiv.appendChild(angryBtn);

                        

                        // const loadingSection = document.getElementById("loading");
                        // loadingSection.innerHTML = "";

                        articles.appendChild(matchedArticleRow); // append to all articles list
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
        
        // const analyzeUserEmotionButton = document.getElementById('btn-analyzeUser');
        // analyzeUserEmotionButton.addEventListener('click',()=>{
        //     window.location.href = '/userEmotion.html';
        // })
}).catch(err => {
    console.log("err from tfidf: ",err);
}) 
