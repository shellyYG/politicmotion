
finalEmotionClicked = localStorage.getItem("clickedEmotions");
let generalToken = localStorage.getItem("generalToken");
let searchTopic1 = localStorage.getItem("searchTopic1");
let searchTopic2 = localStorage.getItem("searchTopic2");

const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer"+" "+generalToken
}

axios.post(`calUserEmotion`,{
    'finalEmotionClicked': finalEmotionClicked,
    'firstSearchTopic': searchTopic1,
    'secondSearchTopic': searchTopic2

    },{headers: headers})
    .then(res=>{
        const userAvgSentEmotionArray = [];
        userAvgSentEmotionArray.push(res.data.avgUserSentiment);

        const userAvgMagEmotionArray = [];
        userAvgMagEmotionArray.push(res.data.avgUserMagnitude);

        // -----------------------------------------------------------------Get emotion regardless of news source
        const postAvgSentEmotionArray = [];
        postAvgSentEmotionArray.push(localStorage.getItem('avgPostSentiment'));

        const postAvgMagEmotionArray = [];
        postAvgMagEmotionArray.push(localStorage.getItem('avgPostMagnitude'));

        const reactionAvgSentEmotionArray = [];
        reactionAvgSentEmotionArray.push(localStorage.getItem('avgReactionSentiment'));

        const reactionAvgMagEmotionArray = []
        reactionAvgMagEmotionArray.push(localStorage.getItem('avgReactionMagnitude'));

        // -----------------------------------------------------------------Get emotion from certain news source
        const postAvgNYTSentEmotionArray = [];
        postAvgNYTSentEmotionArray.push(localStorage.getItem('avgNYTPostSentiment'));

        const postAvgNYTMagEmotionArray = [];
        postAvgNYTMagEmotionArray.push(localStorage.getItem('avgNYTPostMagnitude'));

        const reactionAvgNYTSentEmotionArray = [];
        reactionAvgNYTSentEmotionArray.push(localStorage.getItem('avgNYTReactionSentiment'));

        const reactionAvgNYTMagEmotionArray = []
        reactionAvgNYTMagEmotionArray.push(localStorage.getItem('avgNYTReactionMagnitude'));

        const postAvgFoxSentEmotionArray = [];
        postAvgFoxSentEmotionArray.push(localStorage.getItem('avgFoxPostSentiment'));

        const postAvgFoxMagEmotionArray = [];
        postAvgFoxMagEmotionArray.push(localStorage.getItem('avgFoxPostMagnitude'));

        const reactionAvgFoxSentEmotionArray = [];
        reactionAvgFoxSentEmotionArray.push(localStorage.getItem('avgFoxReactionSentiment'));

        const reactionAvgFoxMagEmotionArray = []
        reactionAvgFoxMagEmotionArray.push(localStorage.getItem('avgFoxReactionMagnitude'));

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

        // ============================================================== trace by news source
        var traceFBNYTPost = {
            x : postAvgNYTSentEmotionArray,
            y : postAvgNYTMagEmotionArray,
            mode: 'markers+text',
            name: "FB NYT Post Score",
            textposition: 'top center',
            textfont: {
                family:  'Raleway, sans-serif'
            },
            marker: { size: 12 },
            type: 'scatter'
        }

        var traceFBNYTReaction = {
            x : reactionAvgNYTSentEmotionArray,
            y : reactionAvgNYTMagEmotionArray,
            mode: 'markers+text',
            name: "FB NYT Reaction Score",
            textposition: 'top center',
            textfont: {
                family:  'Raleway, sans-serif'
            },
            marker: { size: 12 },
            type: 'scatter'
        }

        var traceFBFoxPost = {
            x : postAvgFoxSentEmotionArray,
            y : postAvgFoxMagEmotionArray,
            mode: 'markers+text',
            name: "FB Fox Post Score",
            textposition: 'top center',
            textfont: {
                family:  'Raleway, sans-serif'
            },
            marker: { size: 12 },
            type: 'scatter'
        }

        var traceFBFoxReaction = {
            x : reactionAvgFoxSentEmotionArray,
            y : reactionAvgFoxMagEmotionArray,
            mode: 'markers+text',
            name: "FB Fox Reaction Score",
            textposition: 'top center',
            textfont: {
                family:  'Raleway, sans-serif'
            },
            marker: { size: 12 },
            type: 'scatter'
        }

        // add average website user score
        
        var data = [traceUser, traceFBNYTPost, traceFBNYTReaction, traceFBFoxPost, traceFBFoxReaction]; //traceFBPost, traceFBReaction, 

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

    }).catch(err=>{
        console.log("err from getting emotion is:", err)
        alert("Sorry, you need to sign in to see your score!");
        window.location.href = '/signIn.html'
    })
localStorage.removeItem("clickedPoints");
localStorage.removeItem("clickedEmotions");
