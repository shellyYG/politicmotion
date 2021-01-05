const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const calPostDateModel = require("../../models/getNews/calPostDateModel"); 

async function tokenizeTime(){
    sqlFoxResult = await calPostDateModel.getFoxWebData();
    const idsFox = sqlFoxResult.map(getUniqueId);
    const tokenedTimesFox = sqlFoxResult.map(relativeToAbsTime);

    sqlFBResult = await calPostDateModel.getFBData();
    const idsFB = sqlFBResult.map(getUniqueId);
    const tokenedTimesFB = sqlFBResult.map(textToAbsTime);
    
    function getUniqueId(news){
        const idList = news.id;
        return idList;
    }

    function relativeToAbsTime(news){
        const tokenizedTime = tokenizer.tokenize(news.published_time);
        const savedDate = news.saved_date;
        
        if(tokenizedTime[1] == "day"){
            const savedDateYear = savedDate.getYear()+1900;
            const savedDateMonth = savedDate.getMonth();
            const savedDateDate = savedDate.getDate();
            var published_date = new Date(savedDateYear, savedDateMonth, savedDateDate-1, "00","00");
        }else if (tokenizedTime[1] == "days"){
            const savedDateYear = savedDate.getYear()+1900;
            const savedDateMonth = savedDate.getMonth();
            const savedDateDate = savedDate.getDate();
            var published_date = new Date(savedDateYear, savedDateMonth, savedDateDate-tokenizedTime[0], "00","00");
        }else if(tokenizedTime[1] == "month"){
            const savedDateYear = savedDate.getYear()+1900;
            const savedDateMonth = savedDate.getMonth();
            const savedDateDate = savedDate.getDate();
            var published_date = new Date(savedDateYear, savedDateMonth-1, savedDateDate, "00","00");
        }else if(tokenizedTime[1] == "months"){
            const savedDateYear = savedDate.getYear()+1900;
            const savedDateMonth = savedDate.getMonth();
            const savedDateDate = savedDate.getDate();
            var published_date = new Date(savedDateYear, savedDateMonth-tokenizedTime[0], savedDateDate, "00","00");
        }else if(tokenizedTime[1] == "year"){
            const savedDateYear = savedDate.getYear()+1900;
            const savedDateMonth = savedDate.getMonth();
            const savedDateDate = savedDate.getDate();
            var published_date = new Date(savedDateYear-1, savedDateMonth, savedDateDate, "00","00");
        }else if(tokenizedTime[1] == "years"){
            const savedDateYear = savedDate.getYear()+1900;
            const savedDateMonth = savedDate.getMonth();
            const savedDateDate = savedDate.getDate();
            var published_date = new Date(savedDateYear-tokenizedTime[0], savedDateMonth, savedDateDate, "00","00");
        }else if(tokenizedTime[1] == "hour" || tokenizedTime[1] == "hours" || tokenizedTime[1] == "min" || tokenizedTime[1] == "mins"){
            var published_date = savedDate;
        }else{
            console.log("published_date format unrecognized!");
            var published_date = savedDate;
        }
        return published_date;
    }

    function textToAbsTime(news){
        const FBTokenizedTime = tokenizer.tokenize(news.post_time);
        const FBsqlFormatDate = FBTokenizedTime[0]+"-"+FBTokenizedTime[1]+"-"+FBTokenizedTime[2];
        return FBsqlFormatDate;
    }

    return [idsFox, tokenedTimesFox, idsFB, tokenedTimesFB];
}


async function savePublishedDate(){

    const processedTimeResult = await tokenizeTime();
    console.log(processedTimeResult[0],processedTimeResult[1],processedTimeResult[2],processedTimeResult[3]);

    for (i=0; i<processedTimeResult[0].length; i++){
        const newsUniqueId = processedTimeResult[0][i];
        const processedPublishedDate = processedTimeResult[1][i];
        const sqlFormatYear = processedPublishedDate.getYear()+1900;
        const sqlFormatMonth = processedPublishedDate.getMonth()+1;
        const sqlFormatDate = processedPublishedDate.getDate();
        const finalsqlFormatDate = sqlFormatYear + "-" + sqlFormatMonth + "-" + sqlFormatDate;
        
        await calPostDateModel.updateNewsRawDataDate(finalsqlFormatDate, newsUniqueId);
        
    }
    
    for (i=0; i<processedTimeResult[2].length; i++){
        const FBnewsUniqueId = processedTimeResult[2][i];
        const FBfinalsqlFormatDate = processedTimeResult[3][i];
        await calPostDateModel.updateFBRasDataDate(FBfinalsqlFormatDate, FBnewsUniqueId);
    }
    console.log("Done inserting post dates!");

    return "success!";
}
savePublishedDate();

// kill the process after 90 sec
setTimeout((function() {
    return process.kill(process.pid);
}), 100000);