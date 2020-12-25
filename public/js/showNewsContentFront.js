let articles = document.querySelector('#articles');
const searchTopic1 = localStorage.getItem("searchTopic1");
const searchTopic2 = localStorage.getItem("searchTopic2");
var finalPointsClicked = localStorage.getItem("clickedPoints");
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

let avgPostSentiment = 0;
let avgPostMagnitude = 0;
let avgReactionSentiment = 0;
let avgReactionMagnitude = 0;

// NYTimes Emotions
let avgNYTPostSentiment = 0;
let avgNYTPostMagnitude = 0;
let avgNYTReactionSentiment = 0;
let avgNYTReactionMagnitude = 0;
let NYTlength = 0;

// Fox Emotions
let avgFoxPostSentiment = 0;
let avgFoxPostMagnitude = 0;
let avgFoxReactionSentiment = 0;
let avgFoxReactionMagnitude = 0;
let FoxLength = 0;

// Link provided
let NYIds = localStorage.getItem('NYIds');
let FoxIds = localStorage.getItem('FoxIds');

try {
    var NYIdsArray = NYIds.split(",")
}catch(err){
    console.log("No NYT news");
    var NYIdsArray = [];
}

try {
    var FoxIdsArray = FoxIds.split(",");
}catch(err){
    console.log("No Fox news");
    var FoxIdsArray = [];
}


axios.post(`showNewsContent`,{
    'searchTopic1': searchTopic1,
    'searchTopic2': searchTopic2,
    'clickedIds': finalPointsClicked,
    'NYIdsArray': NYIdsArray,
    'FoxIdsArray': FoxIdsArray
}).then(res=>{
        var articleRow;
        for (i=0; i<res.data.length; i++){
            // console.log("res.data: ", res.data);
            // ============================================================= Get clicked Articles and create a block
            console.log("res.data[i]: ", res.data[i]);
            if (res.data[i].clickedId !== 0){ // has at least 1 news
                var rawDate = res.data[i].post_date;
                var re = /([^T]+)/;
                console.log("rawDate: ", rawDate);
                var pureDatePart = rawDate.split(re);
                // console.log("pureDatePart: ", pureDatePart);
                var datePart = pureDatePart[1];
                var datePartArray = datePart.split("-");
                // console.log("datePartArray: ", datePartArray);
                
                var beautifyDateYear = datePartArray[0];
                var beautifyDateMonth = datePartArray[1];
                var beautifyDateDate = datePartArray[2];
                var finalBeutifiedDate = beautifyDateYear+"/"+beautifyDateMonth+"/"+beautifyDateDate;
                
                var articleDBId = res.data[i].id;

                // -------------------------------------------------------------------------- set default classes
                articleRow = document.createElement('div');
                articleRow.setAttribute("id", `articleRow_${articleDBId}`);
                articleRow.setAttribute("class", "row");

                articleCol = document.createElement('div');
                articleCol.setAttribute("class", `col-md-6 mb-4 col_selected_${articleDBId}`);
                articleCol.setAttribute("id", "No-match-grow");
                articleRow.appendChild(articleCol);

                cardShadow = document.createElement('article');
                cardShadow.setAttribute("class", "card shadow");
                cardShadow.setAttribute("id", `selectedNews_${articleDBId}`);
                articleCol.appendChild(cardShadow);

                articleBody = document.createElement('div');
                articleBody.setAttribute("class", "card-body");
                articleBody.setAttribute("id", `selected_cbody_${articleDBId}`);
                cardShadow.appendChild(articleBody);

                var articleTitle = document.createElement('h4');
                articleTitle.setAttribute("class","card-title");
                articleTitle.setAttribute("id",`selectedNewsSrc_${articleDBId}`);
                articleTitle.innerText = res.data[i].title; 

                var articleSrcDate = document.createElement('h5');
                articleSrcDate.setAttribute("class", `card-srcdate`);
                articleSrcDate.setAttribute("id", `selectedNewsDate_${articleDBId}`);
                
                var articleContent = document.createElement('p');
                articleContent.setAttribute("class", "cars-text");
                articleContent.setAttribute("id", `selectedNewsContent_${articleDBId}`);

                var articleLink = document.createElement('a');
                articleLink.setAttribute("class", `btn btn-xs btn-primary btn-selected`);
                articleLink.setAttribute("id", `a_${articleDBId}`);

                var iconDiv = document.createElement('div');
                iconDiv.setAttribute("id", "icons");


                var loveBtn = document.createElement("img");
                loveBtn.setAttribute("id", `user_love_${articleDBId}`);
                loveBtn.setAttribute("src", "imgs/iconx/love.png");

                var hahaBtn = document.createElement("img");
                hahaBtn.setAttribute("id", `user_haha_${articleDBId}`);
                hahaBtn.setAttribute("src", "imgs/iconx/haha.png");

                var cryBtn = document.createElement("img");
                cryBtn.setAttribute("id", `user_sad_${articleDBId}`);
                cryBtn.setAttribute("src", "imgs/iconx/sad.png");

                var angryBtn = document.createElement("img");
                angryBtn.setAttribute("id", `user_angry_${articleDBId}`);
                angryBtn.setAttribute("src", "imgs/iconx/angry.png");

                if(res.data[i].lead_paragraph==null){
                    var leadParagraph = '';
                }else{
                    var leadParagraph = res.data[i].lead_paragraph;
                }

                articleContent.textContent = res.data[i].content +" " + leadParagraph;
                
                articleLink.textContent = "Read More";
                if (res.data[i].post_source == 'nytimes'){
                    articleSrcDate.textContent = "New York Times" + " " + finalBeutifiedDate;
                }else{
                    articleSrcDate.textContent = "Fox News"+ " " + finalBeutifiedDate;
                }

                // ===================================calculate average post emotion
                avgPostSentiment += res.data[i].sentiment_score;
                avgPostMagnitude += res.data[i].magnitude_score;
                // ===================================calculate average FB user reaction 
                avgReactionSentiment += res.data[i].user_sentiment_score;
                avgReactionMagnitude += res.data[i].user_magnitude_score;
    
                // -------cal average New York Time post emotion
                if(res.data[i].post_source=="nytimes"){
                    avgNYTPostSentiment += res.data[i].sentiment_score;
                    avgNYTPostMagnitude += res.data[i].magnitude_score;
                    avgNYTReactionSentiment += res.data[i].user_sentiment_score;
                    avgNYTReactionMagnitude += res.data[i].user_magnitude_score;
                    NYTlength += 1;
                }
                // -------cal average Fox post emotion
                if(res.data[i].post_source=="foxnews"){
                    avgFoxPostSentiment += res.data[i].sentiment_score;
                    avgFoxPostMagnitude += res.data[i].magnitude_score;
                    avgFoxReactionSentiment += res.data[i].user_sentiment_score;
                    avgFoxReactionMagnitude += res.data[i].user_magnitude_score;
                    FoxLength += 1;
                }

                // append single article
                articleBody.appendChild(articleTitle);
                articleBody.appendChild(articleSrcDate);
                articleBody.appendChild(articleContent);
                articleBody.appendChild(articleLink);
                articleBody.appendChild(iconDiv);
                
                iconDiv.appendChild(loveBtn);
                iconDiv.appendChild(hahaBtn);
                iconDiv.appendChild(cryBtn);
                iconDiv.appendChild(angryBtn);
                
                // -------------------------------------------------------------------------- set pop up classes
                articleCol2 = document.createElement('div');
                articleCol2.setAttribute("class", `hiddenc col-md-6 mb-4 hcol_selected_${articleDBId}`);
                articleRow.appendChild(articleCol2);

                cardShadow2 = document.createElement('article');
                cardShadow2.setAttribute("class", `card shadow hselectedNews_${articleDBId}`);
                articleCol2.appendChild(cardShadow2);

                articleBody2 = document.createElement('div');
                articleBody2.setAttribute("class", "card-body");
                articleBody2.setAttribute("id", `hselected_cbody_${articleDBId}`);
                cardShadow2.appendChild(articleBody2);

                var articleTitle2 = document.createElement('h4');
                articleTitle2.setAttribute("class","card-title");
                articleTitle2.setAttribute("id",`selectedNewsSrc_${articleDBId}`);
                articleTitle2.innerText = res.data[i].title; 

                var articleSrcDate2 = document.createElement('h5');
                articleSrcDate2.setAttribute("class", `card-srcdate`);
                articleSrcDate2.setAttribute("id", `selectedNewsDate_${articleDBId}`);
                
                var articleContent2 = document.createElement('p');
                articleContent2.setAttribute("class", "cars-text");
                articleContent2.setAttribute("id", `hselectedNewsContent_${articleDBId}`);

                if(res.data[i].lead_paragraph==null){
                    var leadParagraph = '';
                }else{
                    var leadParagraph = res.data[i].lead_paragraph;
                }

                articleContent2.textContent = res.data[i].content +" " + leadParagraph;
                
                if (res.data[i].post_source == 'nytimes'){
                    articleSrcDate2.textContent = "New York Times" + " " + finalBeutifiedDate;
                }else{
                    articleSrcDate2.textContent = "Fox News"+ " " + finalBeutifiedDate;
                }

                var closeBtn = document.createElement('a');
                closeBtn.setAttribute('class', 'btn btn-xs btn-primary btn-selected-close');
                closeBtn.setAttribute('id', 'closeBtn');
                closeBtn.innerText = "close";
                
                // append single article
                articleBody2.appendChild(articleTitle2);
                articleBody2.appendChild(articleSrcDate2);
                articleBody2.appendChild(articleContent2);
                articleBody2.appendChild(closeBtn);
                
                // -------------------------------------------------------------------------- remove loading section
                var loadingSection = document.getElementById("btnLoader");
                loadingSection.innerHTML = "";
                articles.appendChild(articleRow); // append to all articles list
            }
        }

        for (i=0; i<res.data.length; i++){
            var matchedArticleRow;
            // ============================================================= Get matched Articles in same block
            for (j=0;j<res.data.length;j++){
                console.log("res.data[i].clickedId: ", res.data[i].clickedId);
                if (res.data[i].clickedId == 0){ //is a matched article
                    if (res.data[j].matchedId == res.data[i].id){ // if a clickedArticle's matched Article == this matched article
                        var rawDate = res.data[i].post_date;
                        var re = /([^T]+)/;
                        var pureDatePart = rawDate.split(re);
                        console.log("pureDatePart2: ", pureDatePart);
                        var datePart = pureDatePart[1];
                        var datePartArray = datePart.split("-");
                        console.log("datePartArray2: ", datePartArray)
                        
                        var beautifyDateYear = datePartArray[0];
                        var beautifyDateMonth = datePartArray[1];
                        var beautifyDateDate = datePartArray[2];
                        var finalBeutifiedDate = beautifyDateYear+"/"+beautifyDateMonth+"/"+beautifyDateDate;

                        matchedArticleRow = document.getElementById(`articleRow_${res.data[j].id}`);
                        
                        articleDBId = res.data[i].id;

                        articleCol = document.createElement('div');
                        articleCol.setAttribute("class", `col-lg-6 col-sm-6 mb-4 col_matched_${articleDBId}`);
                        matchedArticleRow.appendChild(articleCol);

                        cardShadow = document.createElement('article');
                        cardShadow.setAttribute("class", "card shadow");
                        cardShadow.setAttribute("id", `matchedNews_${articleDBId}`);
                        articleCol.appendChild(cardShadow);

                        articleBody = document.createElement('div');
                        articleBody.setAttribute("class", "card-body");
                        articleBody.setAttribute("id", `matched_cbody_${articleDBId}`);
                        cardShadow.appendChild(articleBody);

                        var articleTitle = document.createElement('h4');
                        articleTitle.setAttribute("class","card-title");
                        articleTitle.setAttribute("id",`matchedNewsSrc_${articleDBId}`);
                        articleTitle.innerText = res.data[i].title;

                        var articleSrcDate = document.createElement('h5');
                        articleSrcDate.setAttribute("class", `card-srcdate`);
                        articleSrcDate.setAttribute("id", `matchedNewsDate_${articleDBId}`);

                        var articleContent = document.createElement('p');
                        articleContent.setAttribute("class", "cars-text");
                        articleContent.setAttribute("id", `matchedNewsContent_${articleDBId}`);

                        var articleLink = document.createElement('a');
                        articleLink.setAttribute("class", `btn btn-xs btn-primary btn-matched`);
                        articleLink.setAttribute("id", `a_${articleDBId}`);
                        // articleLink.setAttribute("href", `${res.data[i].post_link}`);

                        var iconDiv = document.createElement('div');
                        iconDiv.setAttribute("id", "icons");

                        var loveBtn = document.createElement("img");
                        loveBtn.setAttribute("id", `user_love_${articleDBId}`);
                        loveBtn.setAttribute("src", "imgs/iconx/love.png");
        
                        var hahaBtn = document.createElement("img");
                        hahaBtn.setAttribute("id", `user_haha_${articleDBId}`);
                        hahaBtn.setAttribute("src", "imgs/iconx/haha.png");
        
                        var cryBtn = document.createElement("img");
                        cryBtn.setAttribute("id", `user_sad_${articleDBId}`);
                        cryBtn.setAttribute("src", "imgs/iconx/sad.png");
        
                        var angryBtn = document.createElement("img");
                        angryBtn.setAttribute("id", `user_angry_${articleDBId}`);
                        angryBtn.setAttribute("src", "imgs/iconx/angry.png");

                        articleSrcDate.textContent = finalBeutifiedDate;

                        if(res.data[i].lead_paragraph==null){
                            var leadParagraph = '';
                        }else{
                            var leadParagraph = res.data[i].lead_paragraph;
                        }
        
                        // articleSrcDate.textContent = finalBeutifiedDate;
                        articleContent.textContent = res.data[i].content +" " + leadParagraph;
                        
                        articleLink.textContent = "Read More";
                        if (res.data[i].post_source == 'nytimes'){
                            articleSrcDate.textContent = "New York Times" + " " + finalBeutifiedDate;
                        }else{
                            articleSrcDate.textContent = "Fox News"+ " " + finalBeutifiedDate;
                        }

                        // ===================================calculate average post emotion
                        avgPostSentiment += res.data[i].sentiment_score;
                        avgPostMagnitude += res.data[i].magnitude_score;
                        // ===================================calculate average FB user reaction 
                        avgReactionSentiment += res.data[i].user_sentiment_score;
                        avgReactionMagnitude += res.data[i].user_magnitude_score;
            
                        // -------cal average New York Time post emotion
                        if(res.data[i].post_source=="nytimes"){
                            avgNYTPostSentiment += res.data[i].sentiment_score;
                            avgNYTPostMagnitude += res.data[i].magnitude_score;
                            avgNYTReactionSentiment += res.data[i].user_sentiment_score;
                            avgNYTReactionMagnitude += res.data[i].user_magnitude_score;
                            NYTlength += 1;
                        }
                        // -------cal average Fox post emotion
                        if(res.data[i].post_source=="foxnews"){
                            avgFoxPostSentiment += res.data[i].sentiment_score;
                            avgFoxPostMagnitude += res.data[i].magnitude_score;
                            avgFoxReactionSentiment += res.data[i].user_sentiment_score;
                            avgFoxReactionMagnitude += res.data[i].user_magnitude_score;
                            FoxLength += 1;
                        }

                        // append single article
                        
                        articleBody.appendChild(articleTitle);
                        articleBody.appendChild(articleSrcDate);
                        articleBody.appendChild(articleContent);
                        articleBody.appendChild(articleLink);
                        articleBody.appendChild(iconDiv);
                
                        iconDiv.appendChild(loveBtn);
                        iconDiv.appendChild(hahaBtn);
                        iconDiv.appendChild(cryBtn);
                        iconDiv.appendChild(angryBtn);

                        // -------------------------------------------------------------------------- set pop up classes
                        articleCol2 = document.createElement('div');
                        articleCol2.setAttribute("class", `hiddenc col-md-6 mb-4 hcol_matched_${articleDBId}`);
                        articleRow.appendChild(articleCol2);

                        cardShadow2 = document.createElement('article');
                        cardShadow2.setAttribute("class", `card shadow hmatchedNews_${articleDBId}`);
                        articleCol2.appendChild(cardShadow2);

                        articleBody2 = document.createElement('div');
                        articleBody2.setAttribute("class", "card-body");
                        articleBody2.setAttribute("id", `hmatched_cbody_${articleDBId}`);
                        cardShadow2.appendChild(articleBody2);

                        var articleTitle2 = document.createElement('h4');
                        articleTitle2.setAttribute("class","card-title");
                        articleTitle2.setAttribute("id",`matchedNewsSrc_${articleDBId}`);
                        articleTitle2.innerText = res.data[i].title; 

                        var articleSrcDate2 = document.createElement('h5');
                        articleSrcDate2.setAttribute("class", `card-srcdate`);
                        articleSrcDate2.setAttribute("id", `matchedNewsDate_${articleDBId}`);
                        
                        var articleContent2 = document.createElement('p');
                        articleContent2.setAttribute("class", "cars-text");
                        articleContent2.setAttribute("id", `hmatchedNewsContent_${articleDBId}`);

                        if(res.data[i].lead_paragraph==null){
                            var leadParagraph = '';
                        }else{
                            var leadParagraph = res.data[i].lead_paragraph;
                        }

                        articleContent2.textContent = res.data[i].content +" " + leadParagraph;
                        
                        if (res.data[i].post_source == 'nytimes'){
                            articleSrcDate2.textContent = "New York Times" + " " + finalBeutifiedDate;
                        }else{
                            articleSrcDate2.textContent = "Fox News"+ " " + finalBeutifiedDate;
                        }

                        var closeMatchedBtn = document.createElement('a');
                        closeMatchedBtn.setAttribute('class', 'btn btn-xs btn-primary btn-matched-close');
                        closeMatchedBtn.setAttribute('id', 'closeMatchedBtn');
                        closeMatchedBtn.innerText = "close";
                        
                        // append single article
                        articleBody2.appendChild(articleTitle2);
                        articleBody2.appendChild(articleSrcDate2);
                        articleBody2.appendChild(articleContent2);
                        articleBody2.appendChild(closeMatchedBtn);

                        var loadingSection = document.getElementById("btnLoader");
                        loadingSection.innerHTML = "";

                        articles.appendChild(matchedArticleRow); // append to all articles list
                    }

                }
            }
        }
        var userEmotionButtons = document.querySelectorAll('[id^="user_"]');
            
        for (let j = 0; j < userEmotionButtons.length; j++) {
            let userEmotionButton = userEmotionButtons[j];
            let userEmotionId = userEmotionButton.getAttribute('id');

            userEmotionButton.addEventListener('click',()=>{
                userEmotionButton.setAttribute("class", "userEmotionClicked");
                var emotionClicked = localStorage.getItem("clickedEmotions");
                var emotionArray = [];
                if(emotionClicked){
                    emotionArray = JSON.parse(emotionClicked);
                }
                emotionArray.push(userEmotionId);
                localStorage.setItem('clickedEmotions',JSON.stringify(emotionArray));  
                finalEmotionClicked = localStorage.getItem("clickedEmotions");
                
            })
        }
        avgPostSentiment = avgPostSentiment/res.data.length;
        avgPostMagnitude = avgPostMagnitude/res.data.length;
        avgPostSentiment = avgPostSentiment.toFixed(2);
        avgPostMagnitude = avgPostMagnitude.toFixed(2);

        avgReactionSentiment = avgReactionSentiment/res.data.length;
        avgReactionMagnitude = avgReactionMagnitude/res.data.length;
        avgReactionSentiment = avgReactionSentiment.toFixed(2);
        avgReactionMagnitude = avgReactionMagnitude.toFixed(2);

        // by news source
        avgNYTPostSentiment = avgNYTPostSentiment/NYTlength;
        avgNYTPostMagnitude = avgNYTPostMagnitude/NYTlength;
        avgNYTReactionSentiment = avgNYTReactionSentiment/NYTlength;
        avgNYTReactionMagnitude = avgNYTReactionMagnitude/NYTlength;
        avgFoxPostSentiment = avgFoxPostSentiment/FoxLength;
        avgFoxPostMagnitude = avgFoxPostMagnitude/FoxLength;
        avgFoxReactionSentiment = avgFoxReactionSentiment/FoxLength;
        avgFoxReactionMagnitude = avgFoxReactionMagnitude/FoxLength;

        avgNYTPostSentiment = avgNYTPostSentiment.toFixed(2);
        avgNYTPostMagnitude = avgNYTPostMagnitude.toFixed(2);
        avgNYTReactionSentiment = avgNYTReactionSentiment.toFixed(2);
        avgNYTReactionMagnitude = avgNYTReactionMagnitude.toFixed(2);
        avgFoxPostSentiment = avgFoxPostSentiment.toFixed(2);
        avgFoxPostMagnitude = avgFoxPostMagnitude.toFixed(2);
        avgFoxReactionSentiment = avgFoxReactionSentiment.toFixed(2);
        avgFoxReactionMagnitude = avgFoxReactionMagnitude.toFixed(2);

        localStorage.setItem("avgPostSentiment",avgPostSentiment);
        localStorage.setItem("avgPostMagnitude",avgPostMagnitude);
        localStorage.setItem("avgReactionSentiment", avgReactionSentiment);
        localStorage.setItem("avgReactionMagnitude", avgReactionMagnitude);

        localStorage.setItem("avgNYTPostSentiment", avgNYTPostSentiment);
        localStorage.setItem("avgNYTPostMagnitude", avgNYTPostMagnitude);
        localStorage.setItem("avgNYTReactionSentiment", avgNYTReactionSentiment);
        localStorage.setItem("avgNYTReactionMagnitude", avgNYTReactionMagnitude);
        localStorage.setItem("avgFoxPostSentiment", avgFoxPostSentiment);
        localStorage.setItem("avgFoxPostMagnitude", avgFoxPostMagnitude);
        localStorage.setItem("avgFoxReactionSentiment", avgFoxReactionSentiment);
        localStorage.setItem("avgFoxReactionMagnitude", avgFoxReactionMagnitude);
        
        var BlockShowEmotionBtn = document.getElementById('showEmotion');

        var RowShowEmotionBtn = document.createElement('div');
        RowShowEmotionBtn.setAttribute("class", "row");

        var ColShowEmotionBtn = document.createElement('div');
        ColShowEmotionBtn.setAttribute("class", "col-md-12 text-center");
        
        var showEmotionBtn = document.createElement('button');
        showEmotionBtn.setAttribute("class","btn btn-lg btn-primary");
        showEmotionBtn.setAttribute("id","btn-analyzeUser");
        showEmotionBtn.innerText = "Next Step";

        RowShowEmotionBtn.appendChild(ColShowEmotionBtn);
        ColShowEmotionBtn.appendChild(showEmotionBtn);
        BlockShowEmotionBtn.appendChild(RowShowEmotionBtn);

        // ===================================================================================== pop up news when clicked
        var readMoresBtns = document.querySelectorAll('[id^="a_"]');
        console.log("readMoresBtns: ", readMoresBtns)
        readMoresBtns.forEach((e)=>{
            e.addEventListener('click',()=>{
                var idToPopUp = e.getAttribute("id").split("_")[1];
                var classToPopUp = e.getAttribute("class");
                
                if (classToPopUp.includes('btn-selected')){
                    var sectionToPop = document.querySelector(".hcol_selected_"+idToPopUp);
                    var contentSectionToPop = document.querySelector(".hselectedNews_"+idToPopUp);
                    console.log("contentSectionToPop: ", contentSectionToPop);
                    var bodyToPop = document.querySelector("#hselected_cbody_"+idToPopUp);
                    
                    sectionToPop.setAttribute('class', `modalc hcol_selected_${idToPopUp}`);
                    contentSectionToPop.setAttribute('class', `modal-dialog modal-dialog-centered hselectedNews_${idToPopUp}`);
                    contentSectionToPop.setAttribute('id', 'contentSectionToPop');
                    bodyToPop.setAttribute('class', 'modalc-content');
                }else{
                    console.log("matched btn");
                    var sectionToPop = document.querySelector(".hcol_matched_"+idToPopUp);
                    var contentSectionToPop = document.querySelector(".hmatchedNews_"+idToPopUp);
                    console.log("contentSectionToPop: ", contentSectionToPop);
                    var bodyToPop = document.querySelector("#hmatched_cbody_"+idToPopUp);
                    
                    sectionToPop.setAttribute('class', `modalc hcol_matched_${idToPopUp}`);
                    contentSectionToPop.setAttribute('class', `modal-dialog modal-dialog-centered hmatchedNews_${idToPopUp}`);
                    contentSectionToPop.setAttribute('id', 'contentSectionToPop');
                    bodyToPop.setAttribute('class', 'modalc-content');
                }
            })
        })
        // when closed the selected read-more section
        closeBtns = document.querySelectorAll("#closeBtn");
        closeBtns.forEach((e)=>{
            console.log("each close btn:", e);
            e.addEventListener('click',()=>{
                var hiddenElements = document.querySelectorAll('[class^="modalc hcol_selected_"]');
                hiddenElements.forEach((x)=>{
                    x.setAttribute('class',`hiddenc col-md-6 mb-4 ${x.classList[1]}`);
                })
            })
        })

        // when closed the matched read-more section
        closeMatchedBtns = document.querySelectorAll("#closeMatchedBtn");
        closeMatchedBtns.forEach((e)=>{
            console.log("each close btn:", e);
            e.addEventListener('click',()=>{
                var hiddenElements = document.querySelectorAll('[class^="modalc hcol_matched_"]');
                hiddenElements.forEach((x)=>{
                    console.log("x.classList[1]: ", x.classList[1]);
                    x.setAttribute('class',`hiddenc col-md-6 mb-4 ${x.classList[1]}`);
                })
            })
        })

        // when clicked the next step
        const analyzeUserEmotionButton = document.getElementById('btn-analyzeUser');
        analyzeUserEmotionButton.addEventListener('click',()=>{
            window.location.href = '/userEmotion.html';
        })
}).catch(err => {
    console.log("err from tfidf: ",err);
}) 
