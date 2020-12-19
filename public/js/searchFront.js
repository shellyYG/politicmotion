const searchButton = document.getElementById('btn-search');
const analyzeUserEmotionButton = document.getElementById('btn-analyzeUser');

console.log("search button clicked!!");
const searchTopic1 = localStorage.getItem("searchTopic1");
const searchTopic2 = localStorage.getItem("searchTopic2");
const allUserEmotions = [];
var finalEmotionClicked;
let avgPostSentiment = 0;
let avgPostMagnitude = 0;
let avgReactionSentiment = 0;
let avgReactionMagnitude = 0;

async function searchNews(){
    axios.post(`/searchNews`,{
        'searchTopic1': searchTopic1,
        'searchTopic2': searchTopic2
    }).then(res=>{
        if(res.data.FBNYNewsContent == 'NA'){
            alert("No news found!");
            window.location.href="/";
        }else{
            console.log("Has news!");

            // ----------------------------------------------------------------- create graph block
            // const graphBlock = document.getElementById("forSentimentBlock");
            const graphBox = document.getElementById("graphBox");
            const loadingBlock = document.getElementById("loadingBox");

            // ----------------------------------------------------------- get a row container for btn
            const btnRow = document.getElementById('btnRow');

            // ----------------------------------------------------------- append send-button
            const showNewsBtnCol = document.createElement('div');
            showNewsBtnCol.innerHTML = 'Show News'
            showNewsBtnCol.setAttribute("id","showNewsBtnCol");
            showNewsBtnCol.setAttribute("class","btn btn-xs btn-primary offset-md-3 col-lg-2");
            btnRow.appendChild(showNewsBtnCol);

            // ----------------------------------------------------------- append remove-dots-button
            const reselectBtnCol = document.createElement('div');
            reselectBtnCol.innerHTML = 'Clear Dots'
            reselectBtnCol.setAttribute("id","reselectBtnCol");
            reselectBtnCol.setAttribute("class","btn btn-xs btn-primary offset-md-2 col-lg-2");
            btnRow.appendChild(reselectBtnCol);
            
            // ----------------------------------------------------------------- Score of all dots
            const NYSentimentArray = res.data.NYSentimentArray;
            const NYMagnitudeArray = res.data.NYMagnitudeArray;
            const FoxSentimentArray = res.data.FoxSentimentArray;
            const FoxMagnitudeArray = res.data.FoxMagnitudeArray;

            // ----------------------------------------------------------------- Show Sentiment Scatter Plot
            const graph = document.createElement('graph');
            graph.setAttribute("id","sentimentShowgraph");
            graph.setAttribute("style","width:1000px;height:500px;");
            graphBox.appendChild(graph);

            var traceNYT = {
                x : NYSentimentArray,
                y : NYMagnitudeArray,
                mode: 'markers+text',
                name: "New York Times",
                textposition: 'top center',
                textfont: {
                    family:  'Raleway, sans-serif'
                },
                marker: { size: 12, color: 'rgb(255, 255, 255)'}, //, symbol: 'diamond-open'
                type: 'scatter'
            }

            var traceFox = {
                x : FoxSentimentArray,
                y : FoxMagnitudeArray,
                mode: 'markers+text',
                name: "Fox News",
                textposition: 'top center',
                textfont: {
                    family:  'Raleway, sans-serif'
                },
                marker: { size: 12, color: 'rgb(12, 241, 249)'},
                type: 'scatter'
            }
            
            var data = [traceNYT, traceFox];

            var layout = {
                xaxis: {
                    title: {
                        text: 'Mood',
                        font: {
                            size: 20,
                            color: "white"
                        }
                    },
                    range: [-1, 1],
                    showgrid: false, // hind non-zero grid
                    zerolinecolor: 'white',
                    zerolinewidth: 4,
                    showticklabels: true,
                    tickfont: {
                    family: 'Old Standard TT, serif',
                    size: 14,
                    color: 'white'
                    }

                },
                yaxis: {
                    title: {
                        text: 'Intensity',
                        font: {
                            size: 20,
                            color: "white"
                        }
                    },
                    showgrid: false,
                    zerolinecolor: 'white',
                    zerolinewidth: 4,
                    showticklabels: true,
                    tickfont: {
                    family: 'Old Standard TT, serif',
                    size: 14,
                    color: 'white'
                    }
                },
                title: {
                    text: 'News Sentiment & Magnitude Score',
                    font: {
                        size: 24,
                        color: "white"
                    }
                },
                hovermode: 'closest',
                paper_bgcolor: "rgba(0,0,0,0)", //transparent
                plot_bgcolor: "rgba(0,0,0,0)", //transparent
                legend:{
                    x:0.27,
                    y:1.13,
                    orientation:"h", //horizontally placed the legend
                    font:{
                        color: 'white',
                        size: 20
                    }
                }
            }

            var config = {
                displayModeBar: false
            }

            // ----------------------remove loading first
            loadingBlock.innerHTML=""


            // ------------------------------------------------- Create Plot
            Plotly.newPlot(graph, data, layout, config);

            // -------------------------------------------------- Build click event & saved it to localStorage     
            graph.on('plotly_click', function(data){
                for(var i=0; i < data.points.length; i++){
                    // ------------------------------save localstorage
                    Xaxis = data.points[i].x;
                    Yaxis = data.points[i].y;
                    var clickedPoints = localStorage.getItem("clickedPoints");
                    var pointArray = [];
                    if(clickedPoints){
                        pointArray = JSON.parse(clickedPoints);
                    }
                    pointArray.push({"Xaxis": Xaxis, "Yaxis": Yaxis});
                    localStorage.setItem("clickedPoints",JSON.stringify(pointArray));
                    
                    // ------------------------------ add annotation
                    annotate_text = '('+data.points[i].x+", "+data.points[i].y+") selected!";
                    annotation = {
                        text: annotate_text,
                        x: data.points[i].x,
                        y: data.points[i].y,
                        font: {
                            color: "white",
                            size: 20
                        }
                    }

                    annotations = self.annotations || [];
                    
                    annotations.push(annotation);
                    Plotly.relayout(graph,{annotations: annotations});
                }
            })

            // ---------------------------------------------- show news button
            const chooseDotsBtn = document.getElementById("showNewsBtnCol");
            chooseDotsBtn.addEventListener('click',()=>{
                if(!localStorage.getItem("clickedPoints")){
                    console.log("no clicked point!");
                    alert("Please select at least one point.");
                }else{
                    window.location.href = "/showNewsContent.html";
                }
            })
            
            // ---------------------------------------------- remove points
            const reselectNewsBtn = document.getElementById("reselectBtnCol");
            reselectNewsBtn.addEventListener('click',()=>{
                localStorage.removeItem("clickedPoints");
                Plotly.relayout(graph,{annotations: []});
            })
        }
    }).catch(err=>{
        alert("Please select at least one dot!");
        console.log("Please select at least one dot!");
        console.log(err);
    })
    return allUserEmotions; 
}

searchNews();


