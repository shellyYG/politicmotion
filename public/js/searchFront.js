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
        console.log("I am res from Back: ", res.data);
        document.querySelector("#FBNYTContent").innerHTML = res.data.FBNYNewsContent;
        document.querySelector("#FBNYTTime").innerHTML = res.data.FBNYNewsPostDate;
        document.querySelector("#FBNYTLink").innerHTML = res.data.FBNYNewsPostLink;
        document.querySelector("#FBFoxContent").innerHTML = res.data.FBFoxNewsContent;
        document.querySelector("#FBFoxTime").innerHTML = res.data.FBFoxNewsPostDate;
        document.querySelector("#FBFoxLink").innerHTML = res.data.FBFoxNewsPostLink;
    }).catch(err=>{
        console.log(err);
    })
})
