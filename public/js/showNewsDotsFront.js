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
var d3 = Plotly.d3;

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

async function searchNews(){
    axios.post(`/searchNews`,{
        'searchTopic1': searchTopic1,
        'searchTopic2': searchTopic2
    }).then(res=>{
        localStorage.setItem('NYIds',res.data.NYIds);
        localStorage.setItem('FoxIds',res.data.FoxIds);
        
        if(res.data.NYSentimentArray.length == 0){
            alert("Oops, no news found, please choose another topic!");
            window.location.href="/";
        }else{
            console.log("Has news!");

            // ----------------------------------------------------------------- create graph block
            // const graphBlock = document.getElementById("forSentimentBlock");
            const graphBox = document.getElementById("graphBox");
            const loadingBlock = document.getElementById("btnLoader");

            // ----------------------------------------------------------- get a row container for btn
            const btnRow = document.getElementById('btnRow');

            // ----------------------------------------------------------- append remove-dots-button
            const reselectBtnCol = document.createElement('div');
            reselectBtnCol.innerHTML = 'Clear Dots'
            reselectBtnCol.setAttribute("id","reselectBtnCol");
            reselectBtnCol.setAttribute("class","btn btn-xs btn-primary offset-md-2 col-lg-2");
            btnRow.appendChild(reselectBtnCol);

            // ----------------------------------------------------------- append send-button
            const showNewsBtnCol = document.createElement('div');
            showNewsBtnCol.innerHTML = 'Next Step'
            showNewsBtnCol.setAttribute("id","showNewsBtnCol");
            showNewsBtnCol.setAttribute("class","btn btn-xs btn-primary offset-md-3 col-lg-2 active");
            btnRow.appendChild(showNewsBtnCol);
            
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
                    family:  'BwNistaInt-xBd'
                },
                marker: { size: 12, color: 'rgb(255, 255, 255)'}, //, symbol: 'diamond-open'
                type: 'scatter',
                showlegend: true // still show legend when only one trace
            }

            var traceFox = {
                x : FoxSentimentArray,
                y : FoxMagnitudeArray,
                mode: 'markers+text',
                name: "Fox News",
                textposition: 'top center',
                textfont: {
                    family:  'BwNistaInt-xBd'
                },
                marker: { size: 12, color: 'rgb(0,50,255)', symbol: '102'},
                type: 'scatter',
                showlegend: true // still show legend when only one trace
            }
            
            var data = [traceNYT, traceFox];
            console.log("traceNYT: ", traceNYT);
            console.log("traceFox: ", traceFox);

            var layout = {
                // -------------------------------- add a non-zero horizontal line
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
                    showgrid: false, // hide non-zero grid
                    zerolinecolor: 'white',
                    zerolinewidth: 4,
                    showticklabels: true, // show axis title
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
                    text: 'News Sentiment & Magnitude Score',
                    font: {
                        size: 30,
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
            loadingBlock.setAttribute('class', 'row hiddenc')
            loadingBlock.innerHTML=""
            
            // ------------------------------------------------- Create Plot
            Plotly.newPlot(graph, data, layout, config);

            // ------------------------------------------------- Change cursor to pointer
            dragLayer = document.getElementsByClassName('nsewdrag')[0];
            graph.on('plotly_hover', function(data){
                dragLayer.style.cursor = 'pointer'
            });

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
                    annotate_text = "News Selected!"; //'('+data.points[i].x+", "+data.points[i].y+") selected!"
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


