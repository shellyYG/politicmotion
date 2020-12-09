const searchButton = document.getElementById('btn-search');
const chooseSentimentButton = document.getElementById('btn-chooseSentiment');

searchButton.addEventListener('click',()=>{
    
    const firstSearchTopic = document.querySelector("#userInput1").value;
    if(!firstSearchTopic){
        alert("Please input first search term!");
    }else{
        console.log("Has first searched term!!");
        const searchTopic1 = document.querySelector("#userInput1").value;
        const searchTopic2 = document.querySelector("#userInput2").value;
        localStorage.setItem("searchTopic1", searchTopic1);
        localStorage.setItem("searchTopic2", searchTopic2);
        window.location.href = "/showNewsDots.html";
    }

})