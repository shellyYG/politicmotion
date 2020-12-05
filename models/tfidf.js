const express = require('express');

let tokenize = (text)=>text.toLowerCase().split(/[.,?!\s’]+/g);

let makeDictionary = (tokens, array)=>{
    tokens.forEach((token)=>{
        if(!array.includes(token)){
            array.push(token);
        }
    })
    return array;
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

function unique(value, index, self){
    return self.indexOf(value) === index;
}

module.exports = { tokenize, makeDictionary, vsm, termFrequency, logBase10, idf, tfidf, cosine, unique};