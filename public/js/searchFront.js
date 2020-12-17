const searchButton = document.getElementById('btn-search');
const analyzeUserEmotionButton = document.getElementById('btn-analyzeUser');

console.log("search button clicked!!");
const searchTopic1 = localStorage.getItem("searchTopic1");
const searchTopic2 = localStorage.getItem("searchTopic2");
const allUserEmotions = [];
var finalPointsClicked;
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
        // console.log("res.data ss: ", res.data);
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
            console.log("btnRow: ", btnRow)

            // ----------------------------------------------------------- append send-button
            const showNewsBtnCol = document.createElement('div');
            showNewsBtnCol.innerHTML = 'Show News'
            showNewsBtnCol.setAttribute("id","showNewsBtnCol");
            showNewsBtnCol.setAttribute("class","btn offset-md-3 col-lg-2");
            btnRow.appendChild(showNewsBtnCol);
            

            // ----------------------------------------------------------- append remove-dots-button
            const reselectBtnCol = document.createElement('div');
            reselectBtnCol.innerHTML = 'Reselect News'
            reselectBtnCol.setAttribute("id","reselectBtnCol");
            reselectBtnCol.setAttribute("class","btn offset-md-2 col-lg-2");
            btnRow.appendChild(reselectBtnCol);
            
            // ----------------------------------------------------------------- Score of all dots
            const NYSentimentArray = res.data.NYSentimentArray;
            const NYMagnitudeArray = res.data.NYMagnitudeArray;
            const FoxSentimentArray = res.data.FoxSentimentArray;
            const FoxMagnitudeArray = res.data.FoxMagnitudeArray;

            // ----------------------------------------------------------------- Show Sentiment Scatter Plot
            const graph = document.createElement('graph');
            graph.setAttribute("id","sentimentShowgraph");
            graph.setAttribute("style","width:400px;height:400px;");
            
            console.log("graphBox: ", graphBox);

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
                marker: { size: 12 },
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
                hovermode: 'closest',
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)"
            }

            var config = {
                displayModeBar: false
            }

            // ----------------------remove loading first
            loadingBlock.innerHTML=""

            Plotly.newPlot(graph, data, layout, config);

            // -------------------------------------------------- Build click event & saved it to localStorage     
            graph.on('plotly_click', function(data){
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
                    finalPointsClicked = localStorage.getItem("clickedPoints");
                    console.log("finalPointsClicked: ", finalPointsClicked);
                }
            })
            
            chooseDotsBtn.addEventListener('click',()=>{
                if(!localStorage.getItem("clickedPoints")){
                    console.log("no clicked point!");
                    alert("Please select at least one point.");
                }else{
                    window.location.href = "/showNewsContent.html";
                }
                
            })

            reselectNewsBtn.addEventListener('click',()=>{
                localStorage.removeItem("clickedPoints");
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


