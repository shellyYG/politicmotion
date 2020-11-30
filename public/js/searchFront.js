const searchButton = document.getElementById('btn-search');

searchButton.addEventListener('click',()=>{
    console.log("clicked!!");
    const searchTopic1 = document.querySelector("#userInput1").value;
    const searchTopic2 = document.querySelector("#userInput2").value;
    axios.post(`/searchNews`,{
        'searchTopic1': searchTopic1,
        'searchTopic2': searchTopic2
    }).then(res=>{
        console.log("back to front-end!");
    }).catch(err=>{
        console.log(err);
    })
})
