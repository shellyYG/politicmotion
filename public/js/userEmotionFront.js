
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
        console.log("res.data.avgUserSentiment: ", res.data.avgUserSentiment);

        const userAvgMagEmotionArray = [];
        userAvgMagEmotionArray.push(res.data.avgUserMagnitude);
        console.log("res.data.avgUserMagnitude: ", res.data.avgUserMagnitude);

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

        console.log('userAvgSentEmotionArray: ', userAvgSentEmotionArray);
        console.log('userAvgMagEmotionArray: ', userAvgMagEmotionArray);

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

        const loadingSection = document.getElementById("loading");
        loadingSection.innerHTML = "";
        
        Plotly.newPlot(userAndPostEmotionShow, data, layout);

        var ChatWithBuddy = document.createElement('button');
        ChatWithBuddy.innerHTML = 'Chat with Same-Opinions Friends!';
        ChatWithBuddy.setAttribute('id','chat-buddy');
        ChatWithBuddy.setAttribute('class','btn');

        var ChatWithOpposite = document.createElement('button');
        ChatWithOpposite.innerHTML = 'Chat with Different-Opinions Friends!';
        ChatWithOpposite.setAttribute('id','chat-opposite');
        ChatWithOpposite.setAttribute('class', 'btn');

        const GoToChat = document.getElementById('GoToChat');
        console.log("GoToChat: ", GoToChat);
        GoToChat.appendChild(ChatWithBuddy);
        GoToChat.appendChild(ChatWithOpposite);

        // find chat-buddies when clicked
        const ChatWithBuddyBtn = document.getElementById('chat-buddy');
        ChatWithBuddyBtn.addEventListener('click',()=>{ 
            axios.post(`findBuddies`, {
                'firstSearchTopic': searchTopic1,
                'secondSearchTopic': searchTopic2
            },{headers: headers})
            .then(res=>{
                const buddyNamesRank = res.data;
                
                for (i=0; i<buddyNamesRank.length; i++){
                    var buddiesToChat = localStorage.getItem("buddiesToChat");
                    var buddiesToChatArray = [];
                    if(buddiesToChat){
                        buddiesToChatArray = JSON.parse(buddiesToChat);
                    }
                    buddiesToChatArray.push({"buddies": buddyNamesRank[i]});
                    localStorage.setItem("buddiesToChat", JSON.stringify(buddiesToChatArray));
                }
                const finalBuddies = localStorage.getItem("buddiesToChat");
                window.location.href = '/chat.html'; 
            
            })
        })

        // find chat-opposites when clicked
        const ChatWithOppositeBtn = document.getElementById('chat-opposite');
        ChatWithOppositeBtn.addEventListener('click',()=>{
            axios.post(`findOpposites`,{
                'firstSearchTopic': searchTopic1,
                'secondSearchTopic': searchTopic2
            },{headers: headers})
            .then(res=>{
                console.log("findOpposites res: ", res);
                const oppositesNamesRank = res.data;
                for (i=0; i<oppositesNamesRank.length; i++){
                    var oppositesToChat = localStorage.getItem("oppositesToChat");
                    var oppositesToChatArray = [];
                    if(oppositesToChat){
                        oppositesToChatArray = JSON.parse(oppositesToChat);
                    }
                    oppositesToChatArray.push({"opposites": oppositesNamesRank[i]});
                    localStorage.setItem("oppositesToChat", JSON.stringify(oppositesToChatArray));
                }
                const finalOpposites = localStorage.getItem("oppositesToChat");
                console.log("finalOpposites: ", finalOpposites);
                
            })
        })


    }).catch(err=>{
        console.log("err from getting emotion is:", err)
        alert("Sorry, you need to sign in to see your score!");
        window.location.href = '/signIn.html'
    })
localStorage.removeItem("clickedPoints");
localStorage.removeItem("clickedEmotions");







