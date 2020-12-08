let articles = document.querySelector('#articles');
let articleElements = document.querySelectorAll('article');
const searchTopic1 = localStorage.getItem("searchTopic1");
const searchTopic2 = localStorage.getItem("searchTopic2");
var finalPointsClicked = localStorage.getItem("clickedPoints");
let avgPostSentiment = 0;
let avgPostMagnitude = 0;
let avgReactionSentiment = 0;
let avgReactionMagnitude = 0;

if (articleElements.length == 0){
    console.log(articleElements.length);
    console.log("Give-me-those-news clicked. No articles yet.");
}else{
    for (i=0; i<articleElements.length;i++){
        articles.removeChild(articleElements[i]);
    }
    console.log("Removed old articles!");
}

axios.post(`findSimilarNews`,{
    'searchTopic1': searchTopic1,
    'searchTopic2': searchTopic2,
    'clickedIds': finalPointsClicked
}).then(res=>{
        for (i=0; i<res.data.length; i++){
            const allNewsIdShown = [];
            allNewsIdShown.push(res.data[i].id);
            var articleDBId = res.data[i].id;

            var article = document.createElement('article');
            article.setAttribute("id", `article_${articleDBId}`);

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

            // calculate average post emotion
            avgPostSentiment += res.data[i].sentiment_score;
            avgPostMagnitude += res.data[i].magnitude_score;

            // calculate average FB user reaction 
            avgReactionSentiment += res.data[i].user_sentiment_score;
            avgReactionMagnitude += res.data[i].user_magnitude_score;

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

            articles.appendChild(article); // append to all articles list
            localStorage.removeItem("clickedPoints"); // remove local storage items
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

        localStorage.setItem("avgPostSentiment",avgPostSentiment);
        localStorage.setItem("avgPostMagnitude",avgPostMagnitude);
        localStorage.setItem("avgReactionSentiment", avgReactionSentiment);
        localStorage.setItem("avgReactionMagnitude", avgReactionMagnitude);
        const analyzeUserEmotionButton = document.getElementById('btn-analyzeUser');
        analyzeUserEmotionButton.addEventListener('click',()=>{
            window.location.href = '/userEmotion.html';
        })

        
}).catch(err => {
    console.log("err from tfidf: ",err);
}) 
