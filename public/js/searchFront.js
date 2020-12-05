const searchButton = document.getElementById('btn-search');
const chooseSentimentButton = document.getElementById('btn-chooseSentiment')
searchButton.addEventListener('click',()=>{
    console.log("clicked!!");
    const searchTopic1 = document.querySelector("#userInput1").value;
    const searchTopic2 = document.querySelector("#userInput2").value;
    const allUserEmotions = [];
    
    axios.post(`/searchNews`,{
        'searchTopic1': searchTopic1,
        'searchTopic2': searchTopic2
    }).then(res=>{
        // -----------------------------------------------------------------Score of all dots
        const NYSentimentArray = res.data.NYSentimentArray;
        const NYMagnitudeArray = res.data.NYMagnitudeArray;
        const FoxSentimentArray = res.data.FoxSentimentArray;
        const FoxMagnitudeArray = res.data.FoxMagnitudeArray;

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
        var finalPointsClicked;
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
                console.log(finalPointsClicked);
            }
        })
        
        chooseSentimentButton.addEventListener('click',()=>{
            let articles = document.querySelector('#articles');
            let articleElements = document.querySelectorAll('#article');
            if (articleElements.length == 0){
                console.log("No articles yet.");
            }else{
                console.log("articleElements: ", articleElements);
                for (i=0; i<articleElements.length;i++){
                    articles.removeChild(articleElements[i]);
                }
                console.log("Removed old articles!");
            }
            
            axios.post(`tfidf`,{
                'searchTopic1': searchTopic1,
                'searchTopic2': searchTopic2,
                'clickedIds': finalPointsClicked
            }).then(res=>{
                    for (i=0; i<res.data.length; i++){
                        const allNewsIdShown = [];
                        allNewsIdShown.push(res.data[i].id);

                        var article = document.createElement('article');
                        article.setAttribute("id", "article");

                        var articleId = document.createElement('articleId');
                        articleId.setAttribute("id", "articleId");

                        var articleDate = document.createElement('articleDate');
                        articleDate.setAttribute("id", "articleDate");

                        var articleContent = document.createElement('articleContent');
                        articleContent.setAttribute("id", "articleContent");

                        var articleLink = document.createElement('articleLink');
                        articleLink.setAttribute("id", "articleLink");

                        var br = document.createElement("br");
                        var articleDBId = res.data[i].id;

                        var loveBtn = document.createElement("button");
                        loveBtn.innerHTML = "Love";
                        loveBtn.setAttribute("id", `user_loveBtn_${articleDBId}`);
                        var BigLoveBtn = document.createElement("button");
                        BigLoveBtn.innerHTML = "Big Love";
                        BigLoveBtn.setAttribute("id", `user_BigLoveBtn_${articleDBId}`);

                        var angryBtn = document.createElement("button");
                        angryBtn.innerHTML = "Angry";
                        angryBtn.setAttribute("id", `user_angryBtn_${articleDBId}`);
                        var BigAngryBtn = document.createElement("button");
                        BigAngryBtn.innerHTML = "Big Angry";
                        BigAngryBtn.setAttribute("id", `user_BigAngryBtn_${articleDBId}`);

                        var cryBtn = document.createElement("button");
                        cryBtn.innerHTML = "Cry";
                        cryBtn.setAttribute("id", `user_cryBtn_${articleDBId}`);
                        var BigCryBtn = document.createElement("button");
                        BigCryBtn.innerHTML = "Big Cry";
                        BigCryBtn.setAttribute("id", `user_BigCryBtn_${articleDBId}`);

                        var hahaBtn = document.createElement("button");
                        hahaBtn.innerHTML = "Haha";
                        hahaBtn.setAttribute("id", `user_hahaBtn_${articleDBId}`);
                        var BighahaBtn = document.createElement("button");
                        BighahaBtn.innerHTML = "Big Haha";
                        BighahaBtn.setAttribute("id", `user_BighahaBtn_${articleDBId}`);

                        articleId.textContent = res.data[i].id;
                        articleDate.textContent = res.data[i].post_date;
                        articleContent.textContent = res.data[i].content;
                        articleLink.textContent = res.data[i].post_link;

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
                        article.appendChild(br);
                        article.appendChild(BigLoveBtn);
                        article.appendChild(BigAngryBtn);
                        article.appendChild(BigCryBtn);
                        article.appendChild(BighahaBtn);

                        
                        articles.appendChild(article); // append to all articles list
                        localStorage.removeItem("clickedPoints"); // remove local storage items

                        var userEmotionButtons = document.querySelectorAll('[id^="user_"]');
                        
                        for (let i = 0; i < userEmotionButtons.length; i++) {
                            let userEmotionButton = userEmotionButtons[i];
                            let userEmotionId = userEmotionButton.getAttribute('id');
                            console.log("userEmotionId: ", userEmotionId);
                            allUserEmotions.push(userEmotionButton);
                            
                        }
                    }
                
            }).catch(err => {
                console.log("err from tfidf: ",err);
            })  
        })
    }).catch(err=>{
        console.log(err);
    })
    console.log("allUserEmotions: ", allUserEmotions);
    
})
