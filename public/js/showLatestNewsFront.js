let articles = document.querySelector("#articles");
const searchTopic1 = localStorage.getItem("searchTopic1");
const searchTopic2 = localStorage.getItem("searchTopic2");
var finalPointsClicked = localStorage.getItem("clickedPoints");
var clickedSources = localStorage.getItem("clickedSources");

// change login to logout if there is token
if (localStorage.getItem('generalToken')) {
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
if (existedLogoutLink) {
    existedLogoutLink.addEventListener('click', () => {
        localStorage.removeItem('generalToken');
        alert("Successfully logged out!");
        const logInNavReshow = document.getElementById('logInNav');
        logInNavReshow.setAttribute('class', 'nav-item'); //show log in
        existedLogoutLink.setAttribute('class', 'hiddenc'); //hide log out
    })
}

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

axios.post("/latestNews", {
}).then(res => {
    for (i = 0; i < res.data.length; i++) {
        // ============================================================= Get clicked Articles and create a block
        try {
            var rawDate = res.data[i].post_date;
            var re = /([^T]+)/;
            var pureDatePart = rawDate.split(re);
            var datePart = pureDatePart[1];
            var datePartArray = datePart.split("-");

            var beautifyDateYear = datePartArray[0];
            var beautifyDateMonth = datePartArray[1];
            var beautifyDateDate = datePartArray[2];
            var finalBeutifiedDate = beautifyDateYear + "/" + beautifyDateMonth + "/" + beautifyDateDate;

            var articleDBId = res.data[i].id;

            // -------------------------------------------------------------------------- set default classes
            articleRow = document.createElement("div");
            articleRow.setAttribute("id", `articleRow_${articleDBId}`);
            articleRow.setAttribute("class", "row");

            articleCol = document.createElement("div");
            articleCol.setAttribute("class", `col-md-6 mb-4 col_selected_${articleDBId}`);
            articleCol.setAttribute("id", "No-match-grow");
            articleRow.appendChild(articleCol);

            cardShadow = document.createElement("article");
            cardShadow.setAttribute("class", "card shadow");
            cardShadow.setAttribute("id", `selectedNews_${articleDBId}`);
            articleCol.appendChild(cardShadow);

            articleBody = document.createElement("div");
            articleBody.setAttribute("class", "card-body");
            articleBody.setAttribute("id", `selected_cbody_${articleDBId}`);
            cardShadow.appendChild(articleBody);

            var articleTitle = document.createElement("h4");
            articleTitle.setAttribute("class", "card-title");
            articleTitle.setAttribute("id", `selectedNewsSrc_${articleDBId}`);
            articleTitle.innerText = res.data[i].title;

            var articleSrcDate = document.createElement("h5");
            articleSrcDate.setAttribute("class", "card-srcdate");
            articleSrcDate.setAttribute("id", `selectedNewsDate_${articleDBId}`);

            var articleContent = document.createElement("p");
            articleContent.setAttribute("class", "cars-text");
            articleContent.setAttribute("id", `selectedNewsContent_${articleDBId}`);

            var articleLink = document.createElement("a");
            articleLink.setAttribute("class", "btn btn-xs btn-primary btn-selected");
            articleLink.setAttribute("id", `a_${articleDBId}`);

            var iconDiv = document.createElement("div");
            iconDiv.setAttribute("id", `icons_${articleDBId}`);


            var loveBtn = document.createElement("img");
            loveBtn.setAttribute("id", `user_love_${articleDBId}`);
            loveBtn.setAttribute("src", "imgs/iconx/love.png");

            var hahaBtn = document.createElement("img");
            hahaBtn.setAttribute("id", `user_haha_${articleDBId}`);
            hahaBtn.setAttribute("src", "imgs/iconx/haha.png");

            var sadBtn = document.createElement("img");
            sadBtn.setAttribute("id", `user_sad_${articleDBId}`);
            sadBtn.setAttribute("src", "imgs/iconx/sad.png");

            var angryBtn = document.createElement("img");
            angryBtn.setAttribute("id", `user_angry_${articleDBId}`);
            angryBtn.setAttribute("src", "imgs/iconx/angry.png");

            if (res.data[i].lead_paragraph == null) {
                var leadParagraph = "";
            } else {
                var leadParagraph = res.data[i].lead_paragraph;
            }

            if (res.data[i].paragraph == null) {
                var foxParagraph = "";
            } else {
                var foxParagraph = res.data[i].paragraph;
            }

            articleLink.textContent = "Focus Read";
            if (res.data[i].post_source == "nytimes") {
                articleContent.textContent = res.data[i].small_title + " " + leadParagraph;
                articleSrcDate.textContent = "New York Times" + " " + finalBeutifiedDate;
            } else {
                articleContent.textContent = res.data[i].small_title + " " + foxParagraph;
                articleSrcDate.textContent = "Fox News" + " " + finalBeutifiedDate;
            }

            // append single article
            articleBody.appendChild(articleTitle);
            articleBody.appendChild(articleSrcDate);
            articleBody.appendChild(articleContent);
            articleBody.appendChild(articleLink);
            articleBody.appendChild(iconDiv);

            iconDiv.appendChild(loveBtn);
            iconDiv.appendChild(hahaBtn);
            iconDiv.appendChild(sadBtn);
            iconDiv.appendChild(angryBtn);

            // -------------------------------------------------------------------------- set pop up classes
            articleCol2 = document.createElement("div");
            articleCol2.setAttribute("class", `hiddenc col-md-6 mb-4 hcol_selected_${articleDBId}`);
            articleRow.appendChild(articleCol2);

            cardShadow2 = document.createElement("article");
            cardShadow2.setAttribute("class", `card shadow hselectedNews_${articleDBId}`);
            articleCol2.appendChild(cardShadow2);

            articleBody2 = document.createElement("div");
            articleBody2.setAttribute("class", "card-body");
            articleBody2.setAttribute("id", `hselected_cbody_${articleDBId}`);
            cardShadow2.appendChild(articleBody2);

            var articleTitle2 = document.createElement("h4");
            articleTitle2.setAttribute("class", "card-title");
            articleTitle2.setAttribute("id", `selectedNewsSrc_${articleDBId}`);
            articleTitle2.innerText = res.data[i].title;

            var articleSrcDate2 = document.createElement("h5");
            articleSrcDate2.setAttribute("class", "card-srcdate");
            articleSrcDate2.setAttribute("id", `selectedNewsDate_${articleDBId}`);

            var articleContent2 = document.createElement("p");
            articleContent2.setAttribute("class", "cars-text");
            articleContent2.setAttribute("id", `hselectedNewsContent_${articleDBId}`);

            if (res.data[i].lead_paragraph == null) {
                var leadParagraph = "";
            } else {
                var leadParagraph = res.data[i].lead_paragraph;
            }

            if (res.data[i].paragraph == null) {
                var foxParagraph = "";
            } else {
                var foxParagraph = res.data[i].paragraph;
            }

            if (res.data[i].post_source == "nytimes") {
                articleSrcDate2.textContent = "New York Times" + " " + finalBeutifiedDate;
                articleContent2.textContent = res.data[i].small_title + " " + leadParagraph;
            } else {
                articleSrcDate2.textContent = "Fox News" + " " + finalBeutifiedDate;
                articleContent2.textContent = res.data[i].small_title + " " + foxParagraph;
            }


            var closeBtn = document.createElement("a");
            closeBtn.setAttribute("class", "btn btn-xs btn-primary btn-selected-close");
            closeBtn.setAttribute("id", "closeBtn");
            closeBtn.innerText = "close";

            // append single article
            articleBody2.appendChild(articleTitle2);
            articleBody2.appendChild(articleSrcDate2);
            articleBody2.appendChild(articleContent2);
            articleBody2.appendChild(closeBtn);

            // -------------------------------------------------------------------------- remove loading section
            var loadingSection = document.getElementById("btnLoader");
            loadingSection.setAttribute("class", "row hiddenc"); // make margin disappear
            loadingSection.innerHTML = "";
            articles.appendChild(articleRow); // append to all articles list

        } catch (err) {
            console.log(err);
        }
    }

    var BlockBackToSearchBtn = document.getElementById("showEmotion");

    var RowBackToSearchBtn = document.createElement("div");
    RowBackToSearchBtn.setAttribute("class", "row");

    var ColBackToSearchBtn = document.createElement("div");
    ColBackToSearchBtn.setAttribute("class", "col-md-12 text-center");

    var backToSearchBtn = document.createElement("button");
    backToSearchBtn.setAttribute("class", "btn btn-lg btn-primary");
    backToSearchBtn.setAttribute("id", "btn-backToSearch");
    backToSearchBtn.innerText = "Back to Search";

    RowBackToSearchBtn.appendChild(ColBackToSearchBtn);
    ColBackToSearchBtn.appendChild(backToSearchBtn);
    BlockBackToSearchBtn.appendChild(RowBackToSearchBtn);

    // ========================================== Click effect
    var emojis = document.querySelectorAll("[id^=\"user_\"]");
    emojis.forEach(emoji => {
        emoji.addEventListener("click", () => {
            var cId = emoji.getAttribute("id").split("_")[2];
            var emotion = emoji.getAttribute("id").split("_")[1];
            var iconsSection = document.querySelector(`#icons_${cId}`);
            iconsSection.childNodes.forEach(() => {
                // remove bigger attributes
                var bundledLove = document.querySelector(`#user_love_${cId}`);
                var bundledHaha = document.querySelector(`#user_haha_${cId}`);
                var bundledSad = document.querySelector(`#user_sad_${cId}`);
                var bundledAngry = document.querySelector(`#user_angry_${cId}`);
                bundledLove.removeAttribute("class");
                bundledHaha.removeAttribute("class");
                bundledSad.removeAttribute("class");
                bundledAngry.removeAttribute("class");

                // make the one which is clicked bigger
                emoji.setAttribute("class", "userEmotionClicked");
                localStorage.setItem(`emotion_${cId}`, emotion);
            });
        });
    });


    // ===================================================================================== pop up news when clicked
    var readMoresBtns = document.querySelectorAll("[id^=\"a_\"]");
    readMoresBtns.forEach((e) => {
        e.addEventListener("click", () => {
            var idToPopUp = e.getAttribute("id").split("_")[1];
            var classToPopUp = e.getAttribute("class");

            if (classToPopUp.includes("btn-selected")) {
                var sectionToPop = document.querySelector(".hcol_selected_" + idToPopUp);
                var contentSectionToPop = document.querySelector(".hselectedNews_" + idToPopUp);
                var bodyToPop = document.querySelector("#hselected_cbody_" + idToPopUp);

                sectionToPop.setAttribute("class", `modalc hcol_selected_${idToPopUp}`);
                contentSectionToPop.setAttribute("class", `modal-dialog modal-dialog-centered hselectedNews_${idToPopUp}`);
                contentSectionToPop.setAttribute("id", "contentSectionToPop");
                bodyToPop.setAttribute("class", "modalc-content");
            } else {
                var sectionToPop = document.querySelector(".hcol_matched_" + idToPopUp);
                var contentSectionToPop = document.querySelector(".hmatchedNews_" + idToPopUp);
                var bodyToPop = document.querySelector("#hmatched_cbody_" + idToPopUp);

                sectionToPop.setAttribute("class", `modalc hcol_matched_${idToPopUp}`);
                contentSectionToPop.setAttribute("class", `modal-dialog modal-dialog-centered hmatchedNews_${idToPopUp}`);
                contentSectionToPop.setAttribute("id", "contentSectionToPop");
                bodyToPop.setAttribute("class", "modalc-content");
            }
        });
    });
    // when closed the selected read-more section
    closeBtns = document.querySelectorAll("#closeBtn");
    closeBtns.forEach((e) => {
        e.addEventListener("click", () => {
            var hiddenElements = document.querySelectorAll("[class^=\"modalc hcol_selected_\"]");
            hiddenElements.forEach((x) => {
                x.setAttribute("class", `hiddenc col-md-6 mb-4 ${x.classList[1]}`);
            });
        });
    });

    // when closed the matched read-more section
    closeMatchedBtns = document.querySelectorAll("#closeMatchedBtn");
    closeMatchedBtns.forEach((e) => {
        e.addEventListener("click", () => {
            var hiddenElements = document.querySelectorAll("[class^=\"modalc hcol_matched_\"]");
            hiddenElements.forEach((x) => {
                x.setAttribute("class", `hiddenc col-md-6 mb-4 ${x.classList[1]}`);
            });
        });
    });

    // when clicked the next step
    const backToSearchButton = document.getElementById("btn-backToSearch");
    backToSearchButton.addEventListener("click", () => {
        window.location.href = "/search.html";
    });
}).catch(err => {
    console.log("err from tfidf: ", err);
});
