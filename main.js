const stats = require("./statistics.js");
const config = require("./config.js");
const MEAN = 0;

// Gets the PScore, or predicted score given a standard deviation.
function CalcPScore(judgements, stddev, largestValue){
    let lastJudgeMSBorder = 0;
    let prbSum = 0;
    for (let i=0; i < judgements.length; i++){
        let judge = judgements[i];
        let nVal = stats.CDFBetween(lastJudgeMSBorder, judge.msBorder,MEAN,stddev ** 2) * judge.value;
        lastJudgeMSBorder = judge.msBorder;
        prbSum += nVal;
    }

    // Speeds the function up massively by not having to sort for the l
    prbSum /= largestValue

    return prbSum;
}

const ACCEPTABLE_ERROR = 0.001;
const MAX_ITERATIONS = 50;

// Calculates the ExpectedSD.
function ExpectedSD(game, percent, errOnInaccuracy){
    if (percent > 1 || percent < 0 || Number.isNaN(parseInt(percent))){
        throw "(ESD-JS) Invalid percent. Percent must be between 0 and 1, and also a number.";
    }
    let judgements;
    let largestValue;
    if (typeof game === "string"){
        judgements = config.judgements[game];

        if (!judgements){
            throw "(ESD-JS) No default configuration for this game.";
        }
        largestValue = config.judgements[game][0].value;
    }
    else if (typeof game === "object"){
        judgements = game;
        largestValue = judgements.sort((a,b) => b.value - a.value)[0].value;
    }
    else{
        throw "(ESD-JS) Unknown parameter passed as game.";
    }

    // massive optimisation possible here by using better initial estimates with precalc'd table of values.
    // until then, it's just kinda slow.
    let minSD = 0;
    let maxSD = 200;
    let estSD = (minSD + maxSD) / 2;

    // So, fundamentally the function that takes SD and returns estimated percent is NOT invertible.
    // as in, it is very literally not invertible.
    // if you figure it out, let me know.
    // until then; we make MAX_ITERATIONS attempts at finding a value within the acceptable range of error.
    // the defaults for these are 100 for iterations, and 0.001 for error.
    // for most of what i've tested, this has been fine.
    for (let i = 0; i < MAX_ITERATIONS; i++) {
        let pScore = CalcPScore(judgements, estSD,largestValue);

        if (Math.abs(pScore - percent) < ACCEPTABLE_ERROR){
            return estSD;
        }

        if (pScore < percent){
            maxSD = estSD;
        }
        else {
            minSD = estSD;
        }

        if (estSD === (minSD + maxSD) / 2) {
            // if it isn't moving, just terminate
            break;
        }

        estSD = (minSD + maxSD) / 2;
    }

    if (errOnInaccuracy){
        throw "(ESD-JS) Did not reach value within MAX_ITERATIONS (" + MAX_ITERATIONS + ")";
    }
    else {
        console.warn("(ESD-JS) Did not reach value within MAX_ITERATIONS (" + MAX_ITERATIONS + "), returning last estimate (" + estSD + "), which was generated from " + percent + ".")
        return estSD;
    }
}

function ESDCompare(baseESD, compareESD, cdeg=1){
    const CONFIDENCE_DEGREE = cdeg;
    const BASE_CASE = stats.CDFBetween(-1 * CONFIDENCE_DEGREE, CONFIDENCE_DEGREE, 0, 1) / 2;
  
    let inv = false;
    let variance;
    let bound;
    if (compareESD > baseESD) {
        inv = true;
        variance = compareESD ** 2;
        bound = CONFIDENCE_DEGREE * baseESD;
    }
    else {
        variance = baseESD ** 2;
        bound = CONFIDENCE_DEGREE * compareESD;
    }
    let esdc = stats.CDFBetween(-1 * bound, bound, 0, variance) / 2;

    let besdc = BASE_CASE - esdc;
  
    if (inv){
         besdc *= -1;
    }
  
    return (besdc) * 100;
}

// compares two percents with ESDCompare
function PercentCompare(game, baseP, compareP,cdeg){
    let e1 = ExpectedSD(game,baseP);
    let e2 = ExpectedSD(game,compareP);
    return ESDCompare(e1,e2, cdeg);
}

module.exports = {
    calc: ExpectedSD,
    ESDCompare: ESDCompare,
    PercentCompare: PercentCompare
};