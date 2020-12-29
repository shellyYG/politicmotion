finalEmotionClicked = localStorage.getItem("clickedEmotions");
let generalToken = localStorage.getItem("generalToken");
let searchTopic1 = localStorage.getItem("searchTopic1");
let searchTopic2 = localStorage.getItem("searchTopic2");
console.log("finalEmotionClicked: ", finalEmotionClicked);
let step1 = document.getElementById("step1");
let step2 = document.getElementById("step2");
let step3 = document.getElementById("step3");
let step4 = document.getElementById("step4");
step1.addEventListener(("click"), ()=>{
    window.location.href = "/showNewsDots.html";
});
step2.addEventListener(("click"), ()=>{
    window.location.href = "/showNewsContent.html";
});
step3.addEventListener(("click"), ()=>{
    window.location.href = "/userEmotion.html";
});
step4.addEventListener(("click"), ()=>{
    window.location.href = "/chat.html";
});

var usrEmotionDistanceNYT;
usrEmotionDistanceNYT = 30;

var usrEmotionDistanceFox;
usrEmotionDistanceFox = 30;

var usrEmotionDirectionNYT;
var usrEmotionDirectionFox;

const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer" + " " + generalToken
};

axios.post("calUserEmotion", {
    "finalEmotionClicked": finalEmotionClicked,
    "firstSearchTopic": searchTopic1,
    "secondSearchTopic": searchTopic2
}, { headers: headers })
    .then(res => {
        const userAvgSentEmotionArray = [];
        userAvgSentEmotionArray.push(res.data.avgUserSentiment);

        const userAvgMagEmotionArray = [];
        userAvgMagEmotionArray.push(res.data.avgUserMagnitude);

        // -----------------------------------------------------------------Get emotion regardless of news source
        const postAvgSentEmotionArray = [];
        postAvgSentEmotionArray.push(localStorage.getItem("avgPostSentiment"));

        const postAvgMagEmotionArray = [];
        postAvgMagEmotionArray.push(localStorage.getItem("avgPostMagnitude"));

        const reactionAvgSentEmotionArray = [];
        reactionAvgSentEmotionArray.push(localStorage.getItem("avgReactionSentiment"));

        const reactionAvgMagEmotionArray = [];
        reactionAvgMagEmotionArray.push(localStorage.getItem("avgReactionMagnitude"));

        // -----------------------------------------------------------------Get emotion from certain news source
        const postAvgNYTSentEmotionArray = [];
        postAvgNYTSentEmotionArray.push(localStorage.getItem("avgNYTPostSentiment"));

        const postAvgNYTMagEmotionArray = [];
        postAvgNYTMagEmotionArray.push(localStorage.getItem("avgNYTPostMagnitude"));

        const reactionAvgNYTSentEmotionArray = [];
        reactionAvgNYTSentEmotionArray.push(localStorage.getItem("avgNYTReactionSentiment"));

        const reactionAvgNYTMagEmotionArray = [];
        reactionAvgNYTMagEmotionArray.push(localStorage.getItem("avgNYTReactionMagnitude"));

        const postAvgFoxSentEmotionArray = [];
        postAvgFoxSentEmotionArray.push(localStorage.getItem("avgFoxPostSentiment"));

        const postAvgFoxMagEmotionArray = [];
        postAvgFoxMagEmotionArray.push(localStorage.getItem("avgFoxPostMagnitude"));

        const reactionAvgFoxSentEmotionArray = [];
        reactionAvgFoxSentEmotionArray.push(localStorage.getItem("avgFoxReactionSentiment"));

        const reactionAvgFoxMagEmotionArray = [];
        reactionAvgFoxMagEmotionArray.push(localStorage.getItem("avgFoxReactionMagnitude"));


        // -----------------------------------------------------------------Show userAndPostEmotionShow Scatter Plot
        userAndPostEmotionShow = document.getElementById("userAndPostEmotionShow");
        const graphBox = document.getElementById("graphBox");
        const loadingBlock = document.getElementById("btnLoader");
        const graph = document.createElement("graph");
        graph.setAttribute("id", "sentimentShowgraph");
        graph.setAttribute("style", "width:1000px;height:500px;");
        graphBox.appendChild(graph);

        console.log("userAvgSentEmotionArray: ", userAvgSentEmotionArray, "reactionAvgNYTSentEmotionArray: ", reactionAvgNYTSentEmotionArray, "reactionAvgFoxSentEmotionArray: ", reactionAvgFoxSentEmotionArray);
        
        pureDistanceNYT = userAvgSentEmotionArray[0]-reactionAvgNYTSentEmotionArray[0];
        pureDistanceFox = userAvgSentEmotionArray[0]-reactionAvgFoxSentEmotionArray[0];
        usrEmotionDistanceNYT = Math.floor(Math.abs(userAvgSentEmotionArray[0]/reactionAvgNYTSentEmotionArray[0]-1)*100);
        usrEmotionDistanceFox = Math.floor(Math.abs(userAvgSentEmotionArray[0]/reactionAvgFoxSentEmotionArray[0]-1)*100);
        if(isNaN(usrEmotionDistanceNYT)==true){
            usrEmotionDistanceNYT = "";
        }else{
            if(isFinite(usrEmotionDistanceNYT)){ //if its not infinity
                usrEmotionDistanceNYT = usrEmotionDistanceNYT.toString()+"%";
            }else{  //if its infinity
                usrEmotionDistanceNYT = "";
            }
        }
        if(isNaN(usrEmotionDistanceFox)==true){
            usrEmotionDistanceFox = "";
        }else{
            if(isFinite(usrEmotionDistanceFox)){ //if its not infinity
                usrEmotionDistanceFox = usrEmotionDistanceFox.toString()+"%";
            }else{  //if its infinity
                usrEmotionDistanceFox = "";
            }
        }

        var sentenceNYT;
        var sentenceFox;
        console.log("pureDistanceNYT: ", pureDistanceNYT, " pureDistanceFox: ", pureDistanceFox);
        if(pureDistanceNYT>0){
            usrEmotionDirectionNYT = "positive";
            if(pureDistanceFox>0){
                usrEmotionDirectionFox = "positive";
                sentenceNYT = `You are ${usrEmotionDistanceNYT} more ${usrEmotionDirectionNYT} than NYT reader`;
                sentenceFox = ` & ${usrEmotionDistanceFox} more ${usrEmotionDirectionFox} than Fox reader on FB.`;
            }else if(pureDistanceFox == 0){
                sentenceNYT = `You are ${usrEmotionDistanceNYT} more ${usrEmotionDirectionNYT} than NYT reader`;
                sentenceFox = " & have the same emotion as Fox reader on FB.";
            }else if (pureDistanceFox<0){
                usrEmotionDirectionFox = "negative";
                sentenceNYT = `You are ${usrEmotionDistanceNYT} more ${usrEmotionDirectionNYT} than NYT reader`;
                sentenceFox = ` & ${usrEmotionDistanceFox} more ${usrEmotionDirectionFox} than Fox reader on FB.`;
            }else{
                console.log("No Fox news");
                sentenceNYT = `You are ${usrEmotionDistanceNYT} more ${usrEmotionDirectionNYT} than NYT reader on FB.`;
                sentenceFox = "";
            }
        }else if (pureDistanceNYT == 0){
            sentenceNYT = "You have the same emotion as NYT reader";
            if(pureDistanceFox>0){
                usrEmotionDirectionFox = "positive";
                sentenceFox = ` & ${usrEmotionDistanceFox} more ${usrEmotionDirectionFox} than Fox reader on FB.`;
            }else if(pureDistanceFox == 0){
                sentenceFox = " & have the same emotion as Fox reader on FB.";
            }else if (pureDistanceFox<0){
                usrEmotionDirectionFox = "negative";
                sentenceFox = ` & ${usrEmotionDistanceFox} more ${usrEmotionDirectionFox} than Fox reader on FB.`;
            }else{
                console.log("No Fox news");
                sentenceFox = ".";
            }
        }else if (pureDistanceNYT<0){
            usrEmotionDirectionNYT = "negative";
            sentenceNYT = `You are ${usrEmotionDistanceNYT} more ${usrEmotionDirectionNYT} than NYT reader`;
            if(pureDistanceFox>0){
                usrEmotionDirectionFox = "positive";
                sentenceFox = ` & ${usrEmotionDistanceFox} more ${usrEmotionDirectionFox} than Fox reader on FB.`;
            }else if(pureDistanceFox == 0){
                sentenceFox = " & have the same emotion as Fox reader on FB.";
            }else if (pureDistanceFox<0){
                usrEmotionDirectionFox = "negative";
                sentenceFox = ` & ${usrEmotionDistanceFox} more ${usrEmotionDirectionFox} than Fox reader on FB.`;
            }else{
                console.log("No Fox news");
                sentenceFox = ".";
            }
        }else{
            console.log("No NYT news");
            sentenceNYT = "";
            if(pureDistanceFox>0){
                usrEmotionDirectionFox = "positive";
                sentenceFox = `You are ${usrEmotionDistanceFox} more ${usrEmotionDirectionFox} than Fox reader on FB.`;
            }else if(pureDistanceFox == 0){
                sentenceFox = "You are have the same emotion as Fox reader on FB.";
            }else if (pureDistanceFox<0){
                usrEmotionDirectionFox = "negative";
                sentenceFox = `You are ${usrEmotionDistanceFox} more ${usrEmotionDirectionFox} than Fox reader on FB.`;
            }else{
                console.log("No Fox news");
                sentenceFox = "";
            }
        }

        var traceUser = {
            x: userAvgSentEmotionArray,
            y: userAvgMagEmotionArray,
            mode: "markers+text",
            name: "You",
            textposition: "top center",
            textfont: {
                family: "Raleway, sans-serif"
            },
            marker: { size: 30, color: "rgb(255,167,255)", symbol: "diamond"},
            type: "scatter"
        };

        // ============================================================== trace by news source
        var traceFBNYTPost = {
            x: postAvgNYTSentEmotionArray,
            y: postAvgNYTMagEmotionArray,
            mode: "markers+text",
            name: "NYT",
            textposition: "top center",
            textfont: {
                family: "Raleway, sans-serif"
            },
            marker: { size: 20, color: "rgb(0, 240, 255)", symbol: "105-open"},
            type: "scatter"
        };

        var traceFBNYTReaction = {
            x: reactionAvgNYTSentEmotionArray,
            y: reactionAvgNYTMagEmotionArray,
            mode: "markers+text",
            name: "FB User ON NYT",
            textposition: "top center",
            textfont: {
                family: "Raleway, sans-serif"
            },
            marker: { size: 20, color: "rgb(0, 240, 255)", symbol: "diamond"},
            type: "scatter"
        };

        var traceFBFoxPost = {
            x: postAvgFoxSentEmotionArray,
            y: postAvgFoxMagEmotionArray,
            mode: "markers+text",
            name: "Fox",
            textposition: "top center",
            textfont: {
                family: "Raleway, sans-serif"
            },
            marker: { size: 20, color: "rgb(255, 204, 0)", symbol: "105-open" },
            type: "scatter"
        };

        var traceFBFoxReaction = {
            x: reactionAvgFoxSentEmotionArray,
            y: reactionAvgFoxMagEmotionArray,
            mode: "markers+text",
            name: "FB User ON Fox",
            textposition: "top center",
            textfont: {
                family: "Raleway, sans-serif"
            },
            marker: { size: 20, color: "rgb(255, 204, 0)", symbol: "diamond"  },
            type: "scatter"
        };

        // add average website user score

        var data = [traceUser, traceFBNYTPost, traceFBNYTReaction, traceFBFoxPost, traceFBFoxReaction]; //traceFBPost, traceFBReaction, 

        var layout = {
            hovermode: false,
            shapes: [{
                type: "line",
                x0: -1,
                x1: 1,
                y0: 1.5,
                y1: 1.5,
                line: {
                    color: "white",
                    width: 4
                }
            }
        ],
            xaxis: {
                title: {
                    text: "<b>Mood</b>",
                    font: {
                        size: 20,
                        color: "white",
                    }
                },
                range: [-1, 1],
                showgrid: false, // hind non-zero grid
                zerolinecolor: "white",
                zerolinewidth: 4,
                showticklabels: true,
                tickfont: {
                    family: "BwNistaInt-xBd",
                    size: 18,
                    color: "white"
                },
                tickvals: [-0.5, 0, 0.5],
                ticktext:["Negative", "Neutral", "Positive"]
            },
            yaxis: {
                title: {
                    text: "<b>Intensity</b>",
                    font: {
                        size: 20,
                        color: "white"
                    }
                },
                range: [-0.1, 3.0],
                showgrid: false,
                zeroline: false,
                showticklabels: true,
                tickfont: {
                    family: "BwNistaInt-xBd",
                    size: 18,
                    color: "white"
                },
                tickvals: [0.6, 2.2],
                ticktext:["Light", "Strong"],
                tickangle: 270
            },
            paper_bgcolor: "rgba(0,0,0,0)", //transparent
            plot_bgcolor: "rgba(0,0,0,0)", //transparent
            legend: {
                x: 0.2,
                y: 1.13,
                orientation: "h", //horizontally placed the legend
                font: {
                    color: "white",
                    size: 14
                }
            }
        };


        var config = {
            displayModeBar: false
        };

        // ----------------------remove loading first
        loadingBlock.setAttribute("class", "row hiddenc");
        loadingBlock.innerHTML = "";

        const resultHolderCol = document.getElementById("resultHolderCol");
        const resultHolder = document.getElementById("resultHolder");
        resultHolder.setAttribute("class","row");
        const resultText = document.createElement("b");
        resultText.setAttribute("id", "resultText");
        resultText.innerText = `${sentenceNYT}${sentenceFox}`;
        resultHolderCol.appendChild(resultText);
       
        console.log("`${sentenceNYT}${sentenceFox}`: ", `${sentenceNYT}${sentenceFox}`);
       

        // ------------------------------------------------- Create Plot
        Plotly.newPlot(graph, data, layout, config);

        const GoToChat = document.getElementById("GoToChat");
        
        var chatBtnRow = document.createElement("div");
        chatBtnRow.setAttribute("class","col-md-12 text-center chat-button");
        chatBtnRow.setAttribute("style", "margin-top: 50px;");
        GoToChat.appendChild(chatBtnRow);

        var ChatWithBuddy = document.createElement("button");
        ChatWithBuddy.innerHTML = "Meet people who care about the same topic ";
        ChatWithBuddy.setAttribute("id", "chat-buddy");
        ChatWithBuddy.setAttribute("class", "btn btn-large btn-primary");
        chatBtnRow.appendChild(ChatWithBuddy);

        // find chat-buddies when clicked
        const ChatWithBuddyBtn = document.getElementById("chat-buddy");
        ChatWithBuddyBtn.addEventListener("click", () => {
            axios.post("findBuddies", {
                "firstSearchTopic": searchTopic1,
                "secondSearchTopic": searchTopic2
            }, { headers: headers })
                .then(res => {
                    console.log("res userEmotionFront: ", res);
                    if (res.data.buddyNames.length == null){
                        alert("Sorry, we found no one who has searched for the same topics.");
                    }else{
                        const buddyNamesRank = res.data.buddyNames;
                        const topBuddyNames = res.data.topBuddyNames;
                        const buddySignatures = res.data.buddySignatures;
                        const topBuddySignatures = res.data.topBuddySignatures;
                        console.log("buddySignatures: ", buddySignatures);
                        console.log("topBuddySignatures: ",topBuddySignatures);
                        
                        localStorage.setItem("topBuddyNames", topBuddyNames);
                        localStorage.setItem("topBuddySignatures", topBuddySignatures);

                        for (i = 0; i < buddyNamesRank.length; i++) {
                            var buddiesToChat = localStorage.getItem("buddiesToChat");
                            var buddiesToChatArray = [];
                            if (buddiesToChat) {
                                buddiesToChatArray = JSON.parse(buddiesToChat);
                            }
                            buddiesToChatArray.push({ "buddies": buddyNamesRank[i] });
                            localStorage.setItem("buddiesToChat", JSON.stringify(buddiesToChatArray));
                        }

                        for (i = 0; i < buddySignatures.length; i++) {
                            var buddySignaturesToChat = localStorage.getItem("buddySignatures");
                            var buddySignaturesArray = [];
                            if (buddySignaturesToChat) {
                                buddySignaturesArray = JSON.parse(buddySignaturesToChat);
                            }
                            buddySignaturesArray.push({ "signatures": buddySignatures[i] });
                            localStorage.setItem("buddySignatures", JSON.stringify(buddySignaturesArray));
                        }

                        

                        window.location.href = "/chat.html";
                    }
                });
        });

        


    }).catch(err => {
        console.log("err from getting emotion is:", err);
        alert("Sorry, you need to sign in to see your score!");
        window.location.href = "/signIn.html";
    });








