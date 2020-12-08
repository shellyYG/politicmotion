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
        console.log("res.data ss: ", res.data);
        if(res.data.FBNYNewsContent == 'NA'){
            alert("No news found!");
            window.location.href="/";
        }else{
            console.log("Has news!");

            // ----------------------------------------------------------------- create graph block
            const graphBlock = document.getElementById("forSentimentBlock");
            
            // ----------------------------------------------------------- append graph
            const graph = document.createElement('graph');
            graph.setAttribute("id","sentimentShow");
            graph.setAttribute("style","width:400px;height:400px;");
            graphBlock.appendChild(graph);
            // ----------------------------------------------------------- append button
            const chooseDotsBtn = document.createElement('button');
            chooseDotsBtn.innerHTML = 'Give me those news & their similar news!'
            chooseDotsBtn.setAttribute("id","btn-chooseSentiment");
            graphBlock.appendChild(chooseDotsBtn);
            const chooseSentimentButton = document.getElementById('btn-chooseSentiment');
            // ----------------------------------------------------------------- Score of all dots
            const NYSentimentArray = res.data.NYSentimentArray;
            const NYMagnitudeArray = res.data.NYMagnitudeArray;
            const FoxSentimentArray = res.data.FoxSentimentArray;
            const FoxMagnitudeArray = res.data.FoxMagnitudeArray;

            // ----------------------------------------------------------------- Show Sentiment Scatter Plot
            sentimentShow = document.getElementById('sentimentShow');
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
                hovermode: 'closest'
            }

            Plotly.newPlot(sentimentShow, data, layout);

            // -------------------------------------------------- Build click event & saved it to localStorage     
            sentimentShow.on('plotly_click', function(data){
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
            
            chooseSentimentButton.addEventListener('click',()=>{
                window.location.href = "/showNewsContent.html";
            })
        }
    }).catch(err=>{
        console.log("Has err!");
        console.log(err);
    })
    return allUserEmotions; 
}

searchNews();


