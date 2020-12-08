
finalEmotionClicked = localStorage.getItem("clickedEmotions");

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
