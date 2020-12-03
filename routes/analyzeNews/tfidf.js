const e = require('express');
const express = require('express');
const router = express.Router();

router.get('/', (req, res)=> {
    res.send('In tfidf Routes');

 //---------------------------------------------------------- Define the algo
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

    function idf(n,allDocArray,wordBags){
        return wordBags.map(calIdfforEachWord);
        function calIdfforEachWord(items){
            const idfcal= logBase10(n/(allDocArray.reduce(reducer,0))); //n is number of articles to compare
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

    let cosine = (tfIdf1,tfIdf2)=>tfIdf1.reduce((acc,curr,index)=>acc+curr*tfIdf2[index],0) / (Math.sqrt(tfIdf1.reduce((acc,curr)=>acc+curr*curr,0))*Math.sqrt(tfIdf2.reduce((acc,curr)=>acc+curr*curr,0)));

    // ------------------------------------------------------------------ calculation part
    let string1 = "How are you? Have you eaten yet?";
    let string2 = "where do you live? Is it in the U.S.?";
    let string3 = "I am in Taiwan yes";
    // console.log("string: ", string1, string2, string3);
    

    let newsWords1 = tokenize(string1);
    let newsWords2 = tokenize(string2);
    let newsWords3 = tokenize(string3);
    // console.log("newsWords: ", newsWords1,newsWords2,newsWords3)
    let allDocArray = [];
    allDocArray.push(newsWords1);
    allDocArray.push(newsWords2);
    allDocArray.push(newsWords3);
    // console.log("allDocArray: ",allDocArray);
    
    let bagOfWords = [];
   

    let finalArray1 = makeDictionary(newsWords1, bagOfWords);
    let finalArray2 = makeDictionary(newsWords2, bagOfWords);
    let finalArray3 = makeDictionary(newsWords3, bagOfWords);
    // console.log("finalArray: ", finalArray1,finalArray2,finalArray3);
    // console.log("bagOfWords: ",bagOfWords)

    let newsVsm1 = vsm(newsWords1,finalArray1);
    let newsVsm2 = vsm(newsWords2,finalArray2);
    let newsVsm3 = vsm(newsWords3,finalArray3);
    // console.log("newsVsm: ", newsVsm1,newsVsm2,newsVsm3)
    
    let tf1 = termFrequency(newsVsm1,newsWords1.length); 
    let tf2 = termFrequency(newsVsm2,newsWords2.length); 
    let tf3 = termFrequency(newsVsm3,newsWords3.length);
    // console.log("singleArray length: ", newsWords1.length, newsWords2.length, newsWords3.length);

    let newsIdf = idf(3,allDocArray,bagOfWords);
  
    console.log("newsIdf: ",newsIdf);


    let tfidf1 = tfidf(tf1,newsIdf);
    let tfidf2 = tfidf(tf2,newsIdf);
    let tfidf3 = tfidf(tf2,newsIdf);
    console.log("tfidf1: ", tfidf1);
    console.log("tfidf2: ", tfidf2);
    console.log("tfidf3: ", tfidf3);

    
    let cosineSim12 = cosine(tfidf(tf1,newsIdf), tfidf(tf2,newsIdf));
    console.log("cosineSim12: ", cosineSim12);
    
    // let cosineSim13 = cosine(tfidf(tf1,newsIdf1), tfidf(tf3,newsIdf3));
    // let cosineSim23 = cosine(tfidf(tf2,newsIdf2), tfidf(tf3,newsIdf3));

    // // console.log("cosineSim13: ", cosineSim13);
    // // console.log("cosineSim23: ", cosineSim23);
  
    

})


module.exports = router;