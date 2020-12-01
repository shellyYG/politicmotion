const searchButton = document.getElementById('btn-search');

searchButton.addEventListener('click',()=>{
    console.log("clicked!!");
    const searchTopic1 = document.querySelector("#userInput1").value;
    const searchTopic2 = document.querySelector("#userInput2").value;
    axios.post(`/searchNews`,{
        'searchTopic1': searchTopic1,
        'searchTopic2': searchTopic2
    }).then(res=>{
        console.log("back to front-end!");
        console.log("I am res from Back: ", res.data);
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
        console.log("f fbNYAvgSentimentScore: ", fbNYAvgSentimentScore);
        const fbNYAvgTMagnitudeScore = res.data.FBNYAvgMag;
        const fbFoxAvgSentimentScore = res.data.FBFoxAvgSentiment;
        const fbFoxAvgTMagnitudeScore = res.data.FBFoxAvgMag;

        // -----------------------------------------------------------------Show Sentiment Scatter Plot
        sentimentShow = document.getElementById('sentimentShow');
        var traceNYT = {
            x : [fbNYTSentimentScore, fbNYAvgSentimentScore],
            y : [fbNYTMagnitudeScore, fbNYAvgTMagnitudeScore],
            mode: 'markers+text',
            name: "New York Times",
            text: ['Single Score', 'Avg Score'],
            textposition: 'top center',
            textfont: {
                family:  'Raleway, sans-serif'
              },
              marker: { size: 12 },
            mode: 'markers',
            type: 'scatter'
        }

        var traceFox = {
            x : [fbFoxSentimentScore, fbFoxAvgSentimentScore],
            y : [fbFoxMagnitudeScore, fbFoxAvgTMagnitudeScore],
            mode: 'markers+text',
            name: "Fox News",
            text: ['Single Score', 'Avg Score'],
            textposition: 'top center',
            textfont: {
                family:  'Raleway, sans-serif'
              },
              marker: { size: 12 },
            mode: 'markers',
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
            title: 'News Sentiment & Magnitude Score'
        }

        Plotly.newPlot(sentimentShow, data, layout);

    }).catch(err=>{
        console.log(err);
    })
})
