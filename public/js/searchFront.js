const searchButton = document.getElementById('btn-search');
const chooseSentimentButton = document.getElementById('btn-chooseSentiment');
const analyzeUserEmotionButton = document.getElementById('btn-analyzeUser');
// const searchTopic1 = document.querySelector("#userInput1").value;

console.log("search button clicked!!");
const searchTopic1 = localStorage.getItem("searchTopic1");
const searchTopic2 = localStorage.getItem("searchTopic2");
const allUserEmotions = [];
var finalPointsClicked;
var finalEmotionClicked;
let avgPostSentiment = 0;
let avgPostMagnitude = 0;
let avgReactionSentiment = 0;
let avgReactionMagnitude = 0;

async function searchNews(){
    axios.post(`/searchNews`,{
        'searchTopic1': searchTopic1,
        'searchTopic2': searchTopic2
    }).then(res=>{
        
        // -----------------------------------------------------------------Score of all dots
        const NYSentimentArray = res.data.NYSentimentArray;
        const NYMagnitudeArray = res.data.NYMagnitudeArray;
        const FoxSentimentArray = res.data.FoxSentimentArray;
        const FoxMagnitudeArray = res.data.FoxMagnitudeArray;

        // window.location.href = "/showNewsDots.html"
        console.log("res.data:", res.data);

        // -----------------------------------------------------------------Show Sentiment Scatter Plot
        sentimentShow = document.getElementById('sentimentShow');
        var traceNYT = {
            x : NYSentimentArray,
            y : NYMagnitudeArray,
            mode: 'markers+text',
            name: "New York Times",
            // text: ['Single Score', 'Avg Score'],
            textposition: 'top center',
            textfont: {
                family:  'Raleway, sans-serif'
            },
            marker: { size: 12 },
            type: 'scatter'
        }

        var traceFox = {
            x : FoxSentimentArray,
            y : FoxMagnitudeArray,
            mode: 'markers+text',
            name: "Fox News",
            // text: ['Single Score', 'Avg Score'],
            textposition: 'top center',
            textfont: {
                family:  'Raleway, sans-serif'
            },
            marker: { size: 12 },
            type: 'scatter'
        }
        
        var data = [traceNYT, traceFox];

        var layout = {
            xaxis: {
                title: 'Sentiment Score',
                range: [-1, 1]
            },
            yaxis: {
                title: 'Magnitude Score'
            },
            title: 'News Sentiment & Magnitude Score',
            hovermode: 'closest'
        }

        Plotly.newPlot(sentimentShow, data, layout);

        // -------------------------------------------------- Build click event & saved it to localStorage     
        
        sentimentShow.on('plotly_click', function(data){
            for(var i=0; i < data.points.length; i++){
                Xaxis = data.points[i].x;
                Yaxis = data.points[i].y;
                var clickedPoints = localStorage.getItem("clickedPoints");
                var pointArray = [];
                if(clickedPoints){
                    pointArray = JSON.parse(clickedPoints);
                }
                pointArray.push({"Xaxis": Xaxis, "Yaxis": Yaxis});
                localStorage.setItem("clickedPoints",JSON.stringify(pointArray));
                finalPointsClicked = localStorage.getItem("clickedPoints");
                console.log("finalPointsClicked: ", finalPointsClicked);
            }
        })
        
        chooseSentimentButton.addEventListener('click',()=>{
            let articles = document.querySelector('#articles');
            let articleElements = document.querySelectorAll('article');
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
                    
                
            }).catch(err => {
                console.log("err from tfidf: ",err);
            }) 
        })
    }).catch(err=>{
        console.log(err);
    })
    return allUserEmotions; 
}

async function afterUserClick(){
    let searchNewsResult = await searchNews();
    searchNewsResult;
    analyzeUserEmotionButton.addEventListener('click',()=>{
        axios.post(`calUserEmotion`,{
            'finalEmotionClicked': finalEmotionClicked
        }).then(res=>{
            const userAvgSentEmotionArray = [];
            userAvgSentEmotionArray.push(res.data.avgUserSentiment);

            const userAvgMagEmotionArray = [];
            userAvgMagEmotionArray.push(res.data.avgUserMagnitude);

            const postAvgSentEmotionArray = [];
            postAvgSentEmotionArray.push(localStorage.getItem('avgPostSentiment'));

            const postAvgMagEmotionArray = [];
            postAvgMagEmotionArray.push(localStorage.getItem('avgPostMagnitude'));

            const reactionAvgSentEmotionArray = [];
            reactionAvgSentEmotionArray.push(localStorage.getItem('avgReactionSentiment'));

            const reactionAvgMagEmotionArray = []
            reactionAvgMagEmotionArray.push(localStorage.getItem('avgReactionMagnitude'));

            // -----------------------------------------------------------------Show userAndPostEmotionShow Scatter Plot
            userAndPostEmotionShow = document.getElementById('userAndPostEmotionShow');
            var traceUser = {
                x : userAvgSentEmotionArray,
                y : userAvgMagEmotionArray,
                mode: 'markers+text',
                name: "Your Score",
                textposition: 'top center',
                textfont: {
                    family:  'Raleway, sans-serif'
                },
                marker: { size: 12 },
                type: 'scatter'
            }
    
            var traceFBPost = {
                x : postAvgSentEmotionArray,
                y : postAvgMagEmotionArray,
                mode: 'markers+text',
                name: "FB Post Score",
                textposition: 'top center',
                textfont: {
                    family:  'Raleway, sans-serif'
                },
                marker: { size: 12 },
                type: 'scatter'
            }

            var traceFBReaction = {
                x : reactionAvgSentEmotionArray,
                y : reactionAvgMagEmotionArray,
                mode: 'markers+text',
                name: "FB User Reaction Score",
                textposition: 'top center',
                textfont: {
                    family:  'Raleway, sans-serif'
                },
                marker: { size: 12 },
                type: 'scatter'
            }

            // add average website user score
            
            var data = [traceUser, traceFBPost, traceFBReaction];
    
            var layout = {
                xaxis: {
                    title: 'Sentiment Score',
                    range: [-1, 1]
                },
                yaxis: {
                    title: 'Magnitude Score'
                },
                title: 'Your Sentiment & Magnitude Score',
                hovermode: 'closest'
            }
    
            Plotly.newPlot(userAndPostEmotionShow, data, layout);

            var ChatWithBuddy = document.createElement('button');
            ChatWithBuddy.innerHTML = 'Chat with Same-Opinions Friends!';
            ChatWithBuddy.setAttribute('id','chat-buddy');

            var ChatWithOpposite = document.createElement('button');
            ChatWithOpposite.innerHTML = 'Chat with Different-Opinions Friends!';
            ChatWithOpposite.setAttribute('id','chat-opposite');

            const GoToChat = document.getElementById('GoToChat');
            console.log("GoToChat: ", GoToChat);
            GoToChat.appendChild(ChatWithBuddy);
            GoToChat.appendChild(ChatWithOpposite);

        })

        localStorage.removeItem("clickedEmotions");
        
    })
    
    
}
afterUserClick()



// searchButton.addEventListener('click',()=>{
//     console.log("search button clicked!!");
//     const searchTopic1 = document.querySelector("#userInput1").value;
//     const searchTopic2 = document.querySelector("#userInput2").value;
//     const allUserEmotions = [];
//     var finalPointsClicked;
//     var finalEmotionClicked;
//     let avgPostSentiment = 0;
//     let avgPostMagnitude = 0;
//     let avgReactionSentiment = 0;
//     let avgReactionMagnitude = 0;

//     async function searchNews(){
//         axios.post(`/searchNews`,{
//             'searchTopic1': searchTopic1,
//             'searchTopic2': searchTopic2
//         }).then(res=>{
            
//             // -----------------------------------------------------------------Score of all dots
//             const NYSentimentArray = res.data.NYSentimentArray;
//             const NYMagnitudeArray = res.data.NYMagnitudeArray;
//             const FoxSentimentArray = res.data.FoxSentimentArray;
//             const FoxMagnitudeArray = res.data.FoxMagnitudeArray;

//             // window.location.href = "/showNewsDots.html"
//             console.log("res.data:", res.data);
    
//             // -----------------------------------------------------------------Show Sentiment Scatter Plot
//             sentimentShow = document.getElementById('sentimentShow');
//             var traceNYT = {
//                 x : NYSentimentArray,
//                 y : NYMagnitudeArray,
//                 mode: 'markers+text',
//                 name: "New York Times",
//                 // text: ['Single Score', 'Avg Score'],
//                 textposition: 'top center',
//                 textfont: {
//                     family:  'Raleway, sans-serif'
//                 },
//                 marker: { size: 12 },
//                 type: 'scatter'
//             }
    
//             var traceFox = {
//                 x : FoxSentimentArray,
//                 y : FoxMagnitudeArray,
//                 mode: 'markers+text',
//                 name: "Fox News",
//                 // text: ['Single Score', 'Avg Score'],
//                 textposition: 'top center',
//                 textfont: {
//                     family:  'Raleway, sans-serif'
//                 },
//                 marker: { size: 12 },
//                 type: 'scatter'
//             }
            
//             var data = [traceNYT, traceFox];
    
//             var layout = {
//                 xaxis: {
//                     title: 'Sentiment Score',
//                     range: [-1, 1]
//                 },
//                 yaxis: {
//                     title: 'Magnitude Score'
//                 },
//                 title: 'News Sentiment & Magnitude Score',
//                 hovermode: 'closest'
//             }
    
//             Plotly.newPlot(sentimentShow, data, layout);
    
//             // -------------------------------------------------- Build click event & saved it to localStorage     
            
//             sentimentShow.on('plotly_click', function(data){
//                 for(var i=0; i < data.points.length; i++){
//                     Xaxis = data.points[i].x;
//                     Yaxis = data.points[i].y;
//                     var clickedPoints = localStorage.getItem("clickedPoints");
//                     var pointArray = [];
//                     if(clickedPoints){
//                         pointArray = JSON.parse(clickedPoints);
//                     }
//                     pointArray.push({"Xaxis": Xaxis, "Yaxis": Yaxis});
//                     localStorage.setItem("clickedPoints",JSON.stringify(pointArray));
//                     finalPointsClicked = localStorage.getItem("clickedPoints");
//                     console.log("finalPointsClicked: ", finalPointsClicked);
//                 }
//             })
            
//             chooseSentimentButton.addEventListener('click',()=>{
//                 let articles = document.querySelector('#articles');
//                 let articleElements = document.querySelectorAll('article');
//                 if (articleElements.length == 0){
//                     console.log(articleElements.length);
//                     console.log("Give-me-those-news clicked. No articles yet.");
//                 }else{
//                     for (i=0; i<articleElements.length;i++){
//                         articles.removeChild(articleElements[i]);
//                     }
//                     console.log("Removed old articles!");
//                 }
                
//                 axios.post(`findSimilarNews`,{
//                     'searchTopic1': searchTopic1,
//                     'searchTopic2': searchTopic2,
//                     'clickedIds': finalPointsClicked
//                 }).then(res=>{
//                         for (i=0; i<res.data.length; i++){
//                             const allNewsIdShown = [];
//                             allNewsIdShown.push(res.data[i].id);
//                             var articleDBId = res.data[i].id;
    
//                             var article = document.createElement('article');
//                             article.setAttribute("id", `article_${articleDBId}`);
    
//                             var articleId = document.createElement('articleId');
//                             articleId.setAttribute("id", `articleId_${articleDBId}`);
    
//                             var articleDate = document.createElement('articleDate');
//                             articleDate.setAttribute("id", `articleDate_${articleDBId}`);
    
//                             var articleContent = document.createElement('articleContent');
//                             articleContent.setAttribute("id", `articleContent_${articleDBId}`);
    
//                             var articleLink = document.createElement('articleLink');
//                             articleLink.setAttribute("id", `articleLink_${articleDBId}`);
    
//                             var br = document.createElement("br");
    
//                             var loveBtn = document.createElement("button");
//                             loveBtn.innerHTML = "Love";
//                             loveBtn.setAttribute("id", `user_loveBtn_${articleDBId}`);
    
//                             var angryBtn = document.createElement("button");
//                             angryBtn.innerHTML = "Angry";
//                             angryBtn.setAttribute("id", `user_angryBtn_${articleDBId}`);
    
//                             var cryBtn = document.createElement("button");
//                             cryBtn.innerHTML = "Cry";
//                             cryBtn.setAttribute("id", `user_cryBtn_${articleDBId}`);
    
//                             var hahaBtn = document.createElement("button");
//                             hahaBtn.innerHTML = "Haha";
//                             hahaBtn.setAttribute("id", `user_hahaBtn_${articleDBId}`);
    
//                             articleId.textContent = res.data[i].id;
//                             articleDate.textContent = res.data[i].post_date;
//                             articleContent.textContent = res.data[i].content;
//                             articleLink.textContent = res.data[i].post_link;

//                             // calculate average post emotion
//                             avgPostSentiment += res.data[i].sentiment_score;
//                             avgPostMagnitude += res.data[i].magnitude_score;

//                             // calculate average FB user reaction 
//                             avgReactionSentiment += res.data[i].user_sentiment_score;
//                             avgReactionMagnitude += res.data[i].user_magnitude_score;

//                             // append single article
//                             article.appendChild(articleId);
//                             article.appendChild(articleDate);
//                             article.appendChild(articleContent);
//                             article.appendChild(articleLink);
//                             article.appendChild(br); //not readable, why?? here
//                             article.appendChild(loveBtn);
//                             article.appendChild(angryBtn);
//                             article.appendChild(cryBtn);
//                             article.appendChild(hahaBtn);
    
//                             articles.appendChild(article); // append to all articles list
//                             localStorage.removeItem("clickedPoints"); // remove local storage items
//                         }
//                         var userEmotionButtons = document.querySelectorAll('[id^="user_"]');
                            
//                         for (let j = 0; j < userEmotionButtons.length; j++) {
//                             let userEmotionButton = userEmotionButtons[j];
//                             let userEmotionId = userEmotionButton.getAttribute('id');

//                             userEmotionButton.addEventListener('click',()=>{
//                                 var emotionClicked = localStorage.getItem("clickedEmotions");
//                                 var emotionArray = [];
//                                 if(emotionClicked){
//                                     emotionArray = JSON.parse(emotionClicked);
//                                 }
//                                 emotionArray.push(userEmotionId);
//                                 localStorage.setItem('clickedEmotions',JSON.stringify(emotionArray));  
//                                 finalEmotionClicked = localStorage.getItem("clickedEmotions");
//                             })
//                         }
//                         avgPostSentiment = avgPostSentiment/res.data.length;
//                         avgPostMagnitude = avgPostMagnitude/res.data.length;
//                         avgPostSentiment = avgPostSentiment.toFixed(2);
//                         avgPostMagnitude = avgPostMagnitude.toFixed(2);

//                         avgReactionSentiment = avgReactionSentiment/res.data.length;
//                         avgReactionMagnitude = avgReactionMagnitude/res.data.length;
//                         avgReactionSentiment = avgReactionSentiment.toFixed(2);
//                         avgReactionMagnitude = avgReactionMagnitude.toFixed(2);

//                         localStorage.setItem("avgPostSentiment",avgPostSentiment);
//                         localStorage.setItem("avgPostMagnitude",avgPostMagnitude);
//                         localStorage.setItem("avgReactionSentiment", avgReactionSentiment);
//                         localStorage.setItem("avgReactionMagnitude", avgReactionMagnitude);
                        
                    
//                 }).catch(err => {
//                     console.log("err from tfidf: ",err);
//                 }) 
//             })
//         }).catch(err=>{
//             console.log(err);
//         })
//         return allUserEmotions; 
//     }

//     async function afterUserClick(){
//         let searchNewsResult = await searchNews();
//         searchNewsResult;
//         analyzeUserEmotionButton.addEventListener('click',()=>{
//             axios.post(`calUserEmotion`,{
//                 'finalEmotionClicked': finalEmotionClicked
//             }).then(res=>{
//                 const userAvgSentEmotionArray = [];
//                 userAvgSentEmotionArray.push(res.data.avgUserSentiment);

//                 const userAvgMagEmotionArray = [];
//                 userAvgMagEmotionArray.push(res.data.avgUserMagnitude);

//                 const postAvgSentEmotionArray = [];
//                 postAvgSentEmotionArray.push(localStorage.getItem('avgPostSentiment'));

//                 const postAvgMagEmotionArray = [];
//                 postAvgMagEmotionArray.push(localStorage.getItem('avgPostMagnitude'));

//                 const reactionAvgSentEmotionArray = [];
//                 reactionAvgSentEmotionArray.push(localStorage.getItem('avgReactionSentiment'));

//                 const reactionAvgMagEmotionArray = []
//                 reactionAvgMagEmotionArray.push(localStorage.getItem('avgReactionMagnitude'));

//                 // -----------------------------------------------------------------Show userAndPostEmotionShow Scatter Plot
//                 userAndPostEmotionShow = document.getElementById('userAndPostEmotionShow');
//                 var traceUser = {
//                     x : userAvgSentEmotionArray,
//                     y : userAvgMagEmotionArray,
//                     mode: 'markers+text',
//                     name: "Your Score",
//                     textposition: 'top center',
//                     textfont: {
//                         family:  'Raleway, sans-serif'
//                     },
//                     marker: { size: 12 },
//                     type: 'scatter'
//                 }
        
//                 var traceFBPost = {
//                     x : postAvgSentEmotionArray,
//                     y : postAvgMagEmotionArray,
//                     mode: 'markers+text',
//                     name: "FB Post Score",
//                     textposition: 'top center',
//                     textfont: {
//                         family:  'Raleway, sans-serif'
//                     },
//                     marker: { size: 12 },
//                     type: 'scatter'
//                 }

//                 var traceFBReaction = {
//                     x : reactionAvgSentEmotionArray,
//                     y : reactionAvgMagEmotionArray,
//                     mode: 'markers+text',
//                     name: "FB User Reaction Score",
//                     textposition: 'top center',
//                     textfont: {
//                         family:  'Raleway, sans-serif'
//                     },
//                     marker: { size: 12 },
//                     type: 'scatter'
//                 }

//                 // add average website user score
                
//                 var data = [traceUser, traceFBPost, traceFBReaction];
        
//                 var layout = {
//                     xaxis: {
//                         title: 'Sentiment Score',
//                         range: [-1, 1]
//                     },
//                     yaxis: {
//                         title: 'Magnitude Score'
//                     },
//                     title: 'Your Sentiment & Magnitude Score',
//                     hovermode: 'closest'
//                 }
        
//                 Plotly.newPlot(userAndPostEmotionShow, data, layout);

//                 var ChatWithBuddy = document.createElement('button');
//                 ChatWithBuddy.innerHTML = 'Chat with Same-Opinions Friends!';
//                 ChatWithBuddy.setAttribute('id','chat-buddy');

//                 var ChatWithOpposite = document.createElement('button');
//                 ChatWithOpposite.innerHTML = 'Chat with Different-Opinions Friends!';
//                 ChatWithOpposite.setAttribute('id','chat-opposite');

//                 const GoToChat = document.getElementById('GoToChat');
//                 console.log("GoToChat: ", GoToChat);
//                 GoToChat.appendChild(ChatWithBuddy);
//                 GoToChat.appendChild(ChatWithOpposite);

//             })

//             localStorage.removeItem("clickedEmotions");
            
//         })
        
        
//     }
//     afterUserClick()
    
// })
