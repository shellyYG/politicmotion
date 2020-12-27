
// remove news & emotion when user try to find new topics
localStorage.removeItem("clickedPoints");
localStorage.removeItem("clickedEmotions");
localStorage.removeItem("buddiesToChat");
localStorage.removeItem("topBuddyNames");

var keyArr = [];
console.log(localStorage.length);
for (i=0; i<localStorage.length; i++){
    if (localStorage.key(i).substring(0,7) == 'emotion'){
        keyArr.push(localStorage.key(i));
    }
}

var emotionArray = [];
for (i=0; i < keyArr.length; i++){
    localStorage.removeItem(keyArr[i]);
}

const searchButton = document.getElementById('btn-search');
const chooseSentimentButton = document.getElementById('btn-chooseSentiment');

searchButton.addEventListener('click',()=>{
    const firstSearchTopic = document.querySelector("#userInput1").value;
    const secondSearchTopic = document.querySelector("#userInput2").value;
    if(!firstSearchTopic){
        alert("Please input first search term!");
    }else{
        if(!secondSearchTopic){
            alert("Please provide at least 2 topics!");
        }else{
            console.log("Has 2 searched terms!");
            const searchTopic1 = document.querySelector("#userInput1").value;
            const searchTopic2 = document.querySelector("#userInput2").value;
            localStorage.setItem("searchTopic1", searchTopic1);
            localStorage.setItem("searchTopic2", searchTopic2);
            window.location.href = "/showNewsDots.html";
        }    
    }
})