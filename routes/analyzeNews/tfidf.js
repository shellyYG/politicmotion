const express = require('express');
const router = express.Router();

router.get('/', (req, res)=> {
    res.send('In tfidf Routes');
 //------------------------------------------------------------------------------------------ Define the algo part
    let tokenize = (text)=>text.toLowerCase().split(/[.,?!\s]+/g); 
    let makeDictionary = (tokens, array)=>{
        tokens.forEach((token)=>{
            if(!array.includes(token)){
                array.push(token);
            }
        })
        return array
    }

    function vsm(eachWord, endArray){
        return endArray.map(getEachWordCount);
        function getEachWordCount(singleWord){
            const wordCount = eachWord.reduce(reducer,0) //starting value = 0
            function reducer(acc, curr){
                if(curr==singleWord){
                    acc = acc +1;
                }else{
                    acc;
                }
                return acc;
            }
            return wordCount;
        }  
    }

    function termFrequency(vsm,numberofWords){
        return vsm.map(getEachTermFreq);
        function getEachTermFreq(item){
            return item/numberofWords;
        }
    }

    function logBase10(val){
        return Math.log(val)/Math.log(10);
    }

    function idf(n,newsWords,wordBags){
        return wordBags.map(calIdfforEachWord);
        function calIdfforEachWord(items){
            const idfcal= logBase10(n/(newsWords.reduce(reducer,0))); //n is number of articles to compare
            function reducer(acc,curr){
                if(curr.includes(items)){
                    acc += 1;
                }else{
                    acc = acc;
                }
                return acc;
            }
            return idfcal;
        }
    }

    function tfidf(tf, idf){
        return tf.map(combinedCal)
        function combinedCal(element,index){
            return element*idf[index];
        }
    }

    function cosine(tfIdf1,tfIdf2){
        let nominator = tfIdf1.reduce(calNominator,0);
        let deNominator1 = Math.sqrt(tfIdf1.reduce(sumSquares,0));
        let deNominator2 = Math.sqrt(tfIdf2.reduce(sumSquares,0));
        let finalcousine = nominator/(deNominator1*deNominator2);
        function calNominator(acc, curr, index){
            return acc = acc+curr*tfIdf2[index];  // each element in tfIdf1 * each element in efIdf2
        }
        function sumSquares(acc, curr){
            acc = acc+curr*curr;
            return acc;
        }
        return finalcousine;
    }
 
    //------------------------------------------------------------------------------------------ Get String Part
    let string1 = "Happy Shelly is smiling";
    let string2 = "Sad Shelly is to cry";
    let string3 = "Happy Markus does not like to cry.";
    let allStrings = [string1,string2,string3];
    //------------------------------------------------------------------------------------------ Calculation Part
    let newsWords = [];
    newsWords = allStrings.map(tokenize);
    
    let bagOfWords = [];
    let finalArray = [];

    for (i=0; i<newsWords.length;i++){
        finalArray = makeDictionary(newsWords[i],bagOfWords);
    }
    
    let newsVsms = [];
    for (i=0; i<newsWords.length;i++){
        newsVsms.push(vsm(newsWords[i],finalArray));
    }

    let tfs = [];
    for (i=0; i<newsWords.length;i++){
        tfs.push(termFrequency(newsVsms[i],newsWords[i].length));
    }

    let newsIdf = idf(allStrings.length,newsWords,bagOfWords);

    let tfidfs = [];
    for(i=0; i<tfs.length; i++){
        tfidfs.push(tfidf(tfs[i], newsIdf));
    }

    
    let firstIndex = [];
    let secondIndex = [];
    let allCosines = [];
    
    let stringCosineCombination = [];
    for (i=0;i<tfidfs.length;i++){
        for (j=0;j<tfidfs.length;j++){
            firstIndex.push(i);
            secondIndex.push(j);
            allCosines.push(cosine(tfidfs[i],tfidfs[j]));
            let singleCombination = {};
            singleCombination.firstString = i+1; //need to be id of the article
            singleCombination.secondString= j+1; //need to be id of the article
            singleCombination.cosineValue = cosine(tfidfs[i],tfidfs[j]);
            stringCosineCombination.push(singleCombination);
        }
    }

    console.log("stringCosineCombination: ", stringCosineCombination);

    let cosine12 = cosine(tfidfs[0], tfidfs[1]);
    let cosine13 = cosine(tfidfs[0], tfidfs[2]);
    let cosine23 = cosine(tfidfs[1], tfidfs[2]);

    console.log("Shelly cosine12: ", cosine12, "cosine13: ", cosine13,"cosine23: ", cosine23);
    
    //------------------------------------------------------------------------------------------ Export final output Part
})


module.exports = router;