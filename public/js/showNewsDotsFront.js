const analyzeUserEmotionButton = document.getElementById("btn-analyzeUser");
const searchTopic1 = localStorage.getItem("searchTopic1");
const searchTopic2 = localStorage.getItem("searchTopic2");
const allUserEmotions = [];
var finalEmotionClicked;
let avgPostSentiment = 0;
let avgPostMagnitude = 0;
let avgReactionSentiment = 0;
let avgReactionMagnitude = 0;
var d3 = Plotly.d3;

// remove clickedPoints when the page is loaded
localStorage.removeItem("clickedPoints");
localStorage.removeItem("clickedSources");

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

// change login to logout if there is token
if(localStorage.getItem('generalToken')){
    const logInNav = document.getElementById('logInNav');
    logInNav.setAttribute('class', 'hiddenc');
  
    const navUl = document.getElementById('navUl');
    const logoutList = document.createElement('li');
    const logoutLink = document.createElement('a');
    
    logoutList.setAttribute('class', 'nav-item');
    logoutLink.setAttribute('class', 'nav-link');
    logoutLink.setAttribute('id', 'logoutLink');
    logoutLink.innerText = 'LOG OUT';
  
    navUl.appendChild(logoutList);
    logoutList.appendChild(logoutLink);
}
  
// log out section triggered
var existedLogoutLink = document.getElementById('logoutLink');
if(existedLogoutLink){
    existedLogoutLink.addEventListener('click', ()=>{
        localStorage.removeItem('generalToken');
        alert("Successfully logged out!");
        const logInNavReshow = document.getElementById('logInNav');
        logInNavReshow.setAttribute('class', 'nav-item'); //show log in
        existedLogoutLink.setAttribute('class', 'hiddenc'); //hide log out
    })
}
  

async function searchNews(){
    axios.post("/searchNews",{
        "searchTopic1": searchTopic1,
        "searchTopic2": searchTopic2
    }).then(res=>{
        localStorage.setItem("NYIds",res.data.NYIds);
        localStorage.setItem("FoxIds",res.data.FoxIds);
        
        if(res.data.NYSentimentArray.length == 0 && res.data.FoxSentimentArray.length == 0){
            alert("Oops, no news found, please choose another topic!");
            window.location.href="/search.html";
        }else{
            console.log("Has news!");

            // ----------------------------------------------------------------- create graph block
            // const graphBlock = document.getElementById("forSentimentBlock");
            const graphBox = document.getElementById("graphBox");
            const loadingBlock = document.getElementById("btnLoader");

            // ----------------------------------------------------------- get a row container for btn
            const btnRow = document.getElementById("btnRow");

            // ----------------------------------------------------------- append remove-dots-button
            const reselectBtnCol = document.createElement("div");
            reselectBtnCol.innerHTML = "Clear Dots";
            reselectBtnCol.setAttribute("id","reselectBtnCol");
            reselectBtnCol.setAttribute("class","btn btn-xs btn-primary offset-md-2 col-lg-2");
            btnRow.appendChild(reselectBtnCol);

            // ----------------------------------------------------------- append send-button
            const showNewsBtnCol = document.createElement("div");
            showNewsBtnCol.innerHTML = "Next Step";
            showNewsBtnCol.setAttribute("id","showNewsBtnCol");
            showNewsBtnCol.setAttribute("class","btn btn-xs btn-primary offset-md-3 col-lg-2 active");
            btnRow.appendChild(showNewsBtnCol);
            
            // ----------------------------------------------------------------- Score of all dots
            const NYSentimentArray = res.data.NYSentimentArray;
            const NYMagnitudeArray = res.data.NYMagnitudeArray;
            const FoxSentimentArray = res.data.FoxSentimentArray;
            const FoxMagnitudeArray = res.data.FoxMagnitudeArray;

            // ----------------------------------------------------------------- Show Sentiment Scatter Plot
            const graph = document.createElement("graph");
            graph.setAttribute("id","sentimentShowgraph");
            graph.setAttribute("style","width:1000px;height:500px;");
            graphBox.appendChild(graph);

            var traceNYT = {
                x : NYSentimentArray,
                y : NYMagnitudeArray,
                mode: "markers+text",
                name: "New York Times",
                textposition: "top center",
                textfont: {
                    family:  "BwNistaInt-xBd"
                },
                marker: { size: 12, color: "rgb(0, 240, 255)"}, //, symbol: 'diamond-open'
                type: "scatter",
                showlegend: true // still show legend when only one trace
            };

            var traceFox = {
                x : FoxSentimentArray,
                y : FoxMagnitudeArray,
                mode: "markers+text",
                name: "Fox News",
                textposition: "top center",
                textfont: {
                    family:  "BwNistaInt-xBd"
                },
                marker: { size: 16, color: "rgb(255,204,0)", symbol: "102"},
                type: "scatter",
                showlegend: true // still show legend when only one trace
            };
            
            var data = [traceNYT, traceFox];
            console.log("traceNYT: ", traceNYT);
            console.log("traceFox: ", traceFox);

            var layout = {
                // -------------------------------- add a non-zero horizontal line
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
                            color: "white"
                        }

                    },
                    range: [-1, 1],
                    showgrid: false, // hide non-zero grid
                    zerolinecolor: "white",
                    zerolinewidth: 4,
                    showticklabels: true, // show axis title
                    tickfont: {
                        family: "BwNistaInt-xBd",
                        size: 14,
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
                        size: 14,
                        color: "white"
                    },
                    tickvals: [0.6, 2.2],
                    ticktext:["Light", "Strong"],
                    tickangle: 270
                    
                },
                title: {
                    text: "News Mood & Intensity Score",
                    font: {
                        size: 20,
                        color: "white"
                    }
                },
                hovermode: "closest",
                paper_bgcolor: "rgba(0,0,0,0)", //transparent
                plot_bgcolor: "rgba(0,0,0,0)", //transparent
                legend:{
                    x:0.33,
                    y:1.13,
                    orientation:"h", //horizontally placed the legend
                    font:{
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
            loadingBlock.innerHTML="";
            
            // ------------------------------------------------- Create Plot
            Plotly.newPlot(graph, data, layout, config);

            // ------------------------------------------------- Change cursor to pointer
            dragLayer = document.getElementsByClassName("nsewdrag")[0];
            graph.on("plotly_hover", function(data){
                dragLayer.style.cursor = "pointer";
            });

            // -------------------------------------------------- Build click event & saved it to localStorage     
            graph.on("plotly_click", function(data){

                // create points array
                for(var i=0; i < data.points.length; i++){
                    // ------------------------------save localstorage for sentiment & mag score of points clicked
                    Xaxis = data.points[i].x;
                    Yaxis = data.points[i].y;
                    var clickedPoints = localStorage.getItem("clickedPoints");
                    var pointArray = [];
                    if(clickedPoints){
                        pointArray = JSON.parse(clickedPoints);
                    }
                    pointArray.push({"Xaxis": Xaxis, "Yaxis": Yaxis});
                    localStorage.setItem("clickedPoints",JSON.stringify(pointArray));

                    // ------------------------------save localstorage for news source of points clicked
                    // ----------- to prevent if there is a dot which two news source with the same score
                    if(data.points[i].data.name == "New York Times"){
                        var clickedNewsSource = "nytimes";
                    }else{
                        var clickedNewsSource = "foxnews";
                    }
                    var clickedSources = localStorage.getItem('clickedSources');
                    var sourcesArray = [];
                    if(clickedSources){
                        sourcesArray = JSON.parse(clickedSources);
                    }
                    sourcesArray.push(clickedNewsSource);
                    localStorage.setItem('clickedSources', JSON.stringify(sourcesArray));
                    
                    // ------------------------------ add annotation
                    if(data.points[i].data.name == "New York Times"){
                        var newsSource = "NYT";
                    }else{
                        var newsSource = "Fox";
                    }

                    annotate_text = `${newsSource} selected!`;
                    annotation = {
                        text: annotate_text,
                        x: data.points[i].x,
                        y: data.points[i].y,
                        font: {
                            color: "white",
                            size: 12
                        },
                        showarrow: true,
                        arrowhead: 7,
                        arrowcolor: "white"
                    };

                    annotations = self.annotations || [];
                    
                    annotations.push(annotation);
                    Plotly.relayout(graph,{annotations: annotations});

                    // ---------------------------------------------- remove points
                    var reselectNewsBtn = document.getElementById("reselectBtnCol");
                    reselectNewsBtn.addEventListener("click",()=>{
                        annotations = [];
                        localStorage.removeItem("clickedPoints");
                        localStorage.removeItem("clickedSources");
                        Plotly.relayout(graph,{annotations: []});
                    });
                }
            });

            // ---------------------------------------------- show news button
            const chooseDotsBtn = document.getElementById("showNewsBtnCol");
            chooseDotsBtn.addEventListener("click",()=>{
                if(!localStorage.getItem("clickedPoints")){
                    console.log("no clicked point!");
                    alert("Please select at least one point.");
                }else{
                    window.location.href = "/showNewsContent.html";
                }
            });
            
        }
    }).catch(err=>{
        alert("Please select at least one dot!");
        console.log("Please select at least one dot!");
        console.log(err);
    });
    return allUserEmotions; 
}

searchNews();


