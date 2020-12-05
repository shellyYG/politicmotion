const searchButton = document.getElementById('btn-search');

searchButton.addEventListener('click',()=>{
    console.log("clicked!!");
    const searchTopic1 = document.querySelector("#userInput1").value;
    const searchTopic2 = document.querySelector("#userInput2").value;
    
    axios.post(`/searchNews`,{
        'searchTopic1': searchTopic1,
        'searchTopic2': searchTopic2
    }).then(res=>{
        
        console.log("Back to Front. I am res.data from Back: ", res.data);
        document.querySelector("#FBNYTContent").innerHTML = res.data.FBNYNewsContent;
        document.querySelector("#FBNYTTime").innerHTML = res.data.FBNYNewsPostDate;
        document.querySelector("#FBNYTLink").innerHTML = res.data.FBNYNewsPostLink;
        document.querySelector("#FBFoxContent").innerHTML = res.data.FBFoxNewsContent;
        document.querySelector("#FBFoxTime").innerHTML = res.data.FBFoxNewsPostDate;
        document.querySelector("#FBFoxLink").innerHTML = res.data.FBFoxNewsPostLink;

        // -----------------------------------------------------------------Score of a single news
        const fbNYTSentimentScore = res.data.FBNYNewsSentiment;
        const fbNYTMagnitudeScore = res.data.FBNYNewsMagnitude;
        const fbFoxSentimentScore = res.data.FBFoxNewsSentiment;
        const fbFoxMagnitudeScore = res.data.FBFoxNewsMagnitude;
        // -----------------------------------------------------------------Score of avg news for the same topic
        const fbNYAvgSentimentScore = res.data.FBNYAvgSentiment;
        const fbNYAvgTMagnitudeScore = res.data.FBNYAvgMag;
        const fbFoxAvgSentimentScore = res.data.FBFoxAvgSentiment;
        const fbFoxAvgTMagnitudeScore = res.data.FBFoxAvgMag;
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
            text: ['Single Score', 'Avg Score'],
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
            text: ['Single Score', 'Avg Score'],
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
                const finalPointsClicked = localStorage.getItem("clickedPoints");
                console.log(finalPointsClicked);

                axios.post(`tfidf`,{
                    'searchTopic1': searchTopic1,
                    'searchTopic2': searchTopic2,
                    'clickedIds': finalPointsClicked
                }).then(res=>{
                    // console.log("res.data after tfidf: ", res.data);
                    let article = document.createElement('article');
                    let articles = document.querySelector('#articles');
                    article.textContent = res.data[0].content;
                    articles.appendChild(article);

                }).catch(err => {
                    console.log("err from tfidf: ",err);
                })

                
            }
        })


    }).catch(err=>{
        console.log(err);
    })
})
