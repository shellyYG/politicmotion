finalEmotionClicked = localStorage.getItem("clickedEmotions");
let generalToken = localStorage.getItem("generalToken");
let searchTopic1 = localStorage.getItem("searchTopic1");
let searchTopic2 = localStorage.getItem("searchTopic2");

let step1 = document.getElementById('step1');
let step2 = document.getElementById('step2');
let step3 = document.getElementById('step3');
let step4 = document.getElementById('step4');
step1.addEventListener(('click'), ()=>{
    window.location.href = '/showNewsDots.html'
})
step2.addEventListener(('click'), ()=>{
    window.location.href = '/showNewsContent.html'
})
step3.addEventListener(('click'), ()=>{
    window.location.href = '/userEmotion.html'
})
step4.addEventListener(('click'), ()=>{
    window.location.href = '/chat.html'
})

const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer" + " " + generalToken
}

axios.post(`calUserEmotion`, {
    'finalEmotionClicked': finalEmotionClicked,
    'firstSearchTopic': searchTopic1,
    'secondSearchTopic': searchTopic2
}, { headers: headers })
    .then(res => {
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
        const graphBox = document.getElementById("graphBox");
        const loadingBlock = document.getElementById("btnLoader");
        const graph = document.createElement('graph');
        graph.setAttribute("id", "sentimentShowgraph");
        graph.setAttribute("style", "width:1000px;height:500px;");
        graphBox.appendChild(graph);

        console.log("userAvgSentEmotionArray: ", userAvgSentEmotionArray, "userAvgMagEmotionArray: ", userAvgMagEmotionArray);


        var traceUser = {
            x: userAvgSentEmotionArray,
            y: userAvgMagEmotionArray,
            mode: 'markers+text',
            name: "You",
            textposition: 'top center',
            textfont: {
                family: 'Raleway, sans-serif'
            },
            marker: { size: 40, color: 'rgb(255, 20, 147)', symbol: 'diamond'},
            type: 'scatter'
        }

        // ============================================================== trace by news source
        var traceFBNYTPost = {
            x: postAvgNYTSentEmotionArray,
            y: postAvgNYTMagEmotionArray,
            mode: 'markers+text',
            name: "NYT",
            textposition: 'top center',
            textfont: {
                family: 'Raleway, sans-serif'
            },
            marker: { size: 20, color: 'rgb(255, 255, 255)', symbol: '105-open'},
            type: 'scatter'
        }

        var traceFBNYTReaction = {
            x: reactionAvgNYTSentEmotionArray,
            y: reactionAvgNYTMagEmotionArray,
            mode: 'markers+text',
            name: "FB User ON NYT",
            textposition: 'top center',
            textfont: {
                family: 'Raleway, sans-serif'
            },
            marker: { size: 20, color: 'rgb(255, 255, 255)', symbol: 'diamond'},
            type: 'scatter'
        }

        var traceFBFoxPost = {
            x: postAvgFoxSentEmotionArray,
            y: postAvgFoxMagEmotionArray,
            mode: 'markers+text',
            name: "Fox",
            textposition: 'top center',
            textfont: {
                family: 'Raleway, sans-serif'
            },
            marker: { size: 20, color: 'rgb(12, 241, 249)', symbol: '105-open' },
            type: 'scatter'
        }

        var traceFBFoxReaction = {
            x: reactionAvgFoxSentEmotionArray,
            y: reactionAvgFoxMagEmotionArray,
            mode: 'markers+text',
            name: "FB User ON Fox",
            textposition: 'top center',
            textfont: {
                family: 'Raleway, sans-serif'
            },
            marker: { size: 20, color: 'rgb(12, 241, 249)', symbol: 'diamond'  },
            type: 'scatter'
        }

        // add average website user score

        var data = [traceUser, traceFBNYTPost, traceFBNYTReaction, traceFBFoxPost, traceFBFoxReaction]; //traceFBPost, traceFBReaction, 

        var layout = {
            shapes: [{
                type: 'line',
                x0: -1,
                x1: 1,
                y0: 0.75,
                y1: 0.75,
                line: {
                    color: 'white',
                    width: 4
                }
            }
        ],
            xaxis: {
                title: {
                    text: 'Mood',
                    font: {
                        size: 28,
                        color: "white"
                    }
                },
                range: [-1, 1],
                showgrid: false, // hind non-zero grid
                zerolinecolor: 'white',
                zerolinewidth: 4,
                showticklabels: true,
                tickfont: {
                    family: 'BwNistaInt-xBd',
                    size: 22,
                    color: 'white'
                },
                tickvals: [-1, 0, 1],
                ticktext:['Negative', 'Neutral', 'Positive']
            },
            yaxis: {
                title: {
                    text: 'Intensity',
                    font: {
                        size: 28,
                        color: "white"
                    }
                },
                range: [-0.1, 1.5],
                showgrid: false,
                // zerolinecolor: 'white',
                // zerolinewidth: 4,
                zeroline: false,
                showticklabels: true,
                tickfont: {
                    family: 'BwNistaInt-xBd',
                    size: 22,
                    color: 'white'
                },
                tickvals: [0.3, 1.3],
                ticktext:['Light', 'Strong'],
                tickangle: 270
            },
            title: {
                text: 'Your Emotion Compared With Others',
                font: {
                    size: 30,
                    color: "white"
                },
            },
            hovermode: 'closest',
            paper_bgcolor: "rgba(0,0,0,0)", //transparent
            plot_bgcolor: "rgba(0,0,0,0)", //transparent
            legend: {
                x: 0.12,
                y: 1.13,
                orientation: "h", //horizontally placed the legend
                font: {
                    color: 'white',
                    size: 20
                }
            }
        }


        var config = {
            displayModeBar: false
        }

        // ----------------------remove loading first
        loadingBlock.setAttribute("class", "row hiddenc");
        loadingBlock.innerHTML = ""

        // ------------------------------------------------- Create Plot
        Plotly.newPlot(graph, data, layout, config);

        var ChatWithBuddy = document.createElement('div');
        ChatWithBuddy.innerHTML = 'Meet Similar People';
        ChatWithBuddy.setAttribute('id', 'chat-buddy');
        ChatWithBuddy.setAttribute('class', 'btn btn-xlarge btn-primary offset-md-3 col-lg-2');

        var ChatWithOpposite = document.createElement('div');
        ChatWithOpposite.innerHTML = 'Meet Unalike People';
        ChatWithOpposite.setAttribute('id', 'chat-opposite');
        ChatWithOpposite.setAttribute('class', 'btn btn-xlarge btn-primary offset-md-2 col-lg-2');

        const GoToChat = document.getElementById('GoToChat');

        GoToChat.appendChild(ChatWithBuddy);
        GoToChat.appendChild(ChatWithOpposite);

        // find chat-buddies when clicked
        const ChatWithBuddyBtn = document.getElementById('chat-buddy');
        ChatWithBuddyBtn.addEventListener('click', () => {
            axios.post(`findBuddies`, {
                'firstSearchTopic': searchTopic1,
                'secondSearchTopic': searchTopic2
            }, { headers: headers })
                .then(res => {
                    const buddyNamesRank = res.data;
                    console.log("buddyNamesRank: ", buddyNamesRank);
                    var buddiesToChatpreExist = localStorage.removeItem('buddiesToChat');

                    for (i = 0; i < buddyNamesRank.length; i++) {
                        var buddiesToChat = localStorage.getItem("buddiesToChat");
                        var buddiesToChatArray = [];
                        if (buddiesToChat) {
                            buddiesToChatArray = JSON.parse(buddiesToChat);
                        }
                        buddiesToChatArray.push({ "buddies": buddyNamesRank[i] });
                        localStorage.setItem("buddiesToChat", JSON.stringify(buddiesToChatArray));
                    }
                    const finalBuddies = localStorage.getItem("buddiesToChat");
                    window.location.href = '/chat.html';

                })
        })

        // find chat-opposites when clicked
        const ChatWithOppositeBtn = document.getElementById('chat-opposite');
        ChatWithOppositeBtn.addEventListener('click', () => {
            axios.post(`findOpposites`, {
                'firstSearchTopic': searchTopic1,
                'secondSearchTopic': searchTopic2
            }, { headers: headers })
                .then(res => {
                    console.log("findOpposites res: ", res);
                    const oppositesNamesRank = res.data;
                    for (i = 0; i < oppositesNamesRank.length; i++) {
                        var oppositesToChat = localStorage.getItem("oppositesToChat");
                        var oppositesToChatArray = [];
                        if (oppositesToChat) {
                            oppositesToChatArray = JSON.parse(oppositesToChat);
                        }
                        oppositesToChatArray.push({ "opposites": oppositesNamesRank[i] });
                        localStorage.setItem("oppositesToChat", JSON.stringify(oppositesToChatArray));
                    }
                    const finalOpposites = localStorage.getItem("oppositesToChat");
                    console.log("finalOpposites: ", finalOpposites);

                })
        })


    }).catch(err => {
        console.log("err from getting emotion is:", err)
        alert("Sorry, you need to sign in to see your score!");
        window.location.href = '/signIn.html'
    })








