const searchButton = document.getElementById('btn-search');
const chooseSentimentButton = document.getElementById('btn-chooseSentiment')
searchButton.addEventListener('click',()=>{
    console.log("clicked!!");
    const searchTopic1 = document.querySelector("#userInput1").value;
    const searchTopic2 = document.querySelector("#userInput2").value;
    
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
                        console.log("res.data.length: ", res.data.length);
                        console.log("allNewsIdShown: ", allNewsIdShown);

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

                        articleId.textContent = res.data[i].id;
                        articleDate.textContent = res.data[i].post_date;
                        articleContent.textContent = res.data[i].content;
                        articleLink.textContent = res.data[i].post_link;

                        // append single article
                        article.appendChild(articleId);
                        article.appendChild(articleDate);
                        article.appendChild(articleContent);
                        article.appendChild(articleLink);

                        // append to all articles list
                        articles.appendChild(article);
                        localStorage.removeItem("clickedPoints");
                    }
                
            }).catch(err => {
                console.log("err from tfidf: ",err);
            })  
        })
    }).catch(err=>{
        console.log(err);
    })
})
