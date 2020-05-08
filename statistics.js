// Hi. I was looking for a fast way of doing CDF of the normal distribution.
// This is what I found.
// Excuse the magic number mess, but ERF(x) is a non-elementary function
// and this apparantly gives good estimates in the range we're in.
// thank you - zkldi.

function cdf(x, mean, variance) {
    return 0.5 * (1 + erf((x - mean) / (Math.sqrt(2 * variance))));
}

function erf(x) {
    // save the sign of x
    let sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);
  
    // constants
    let a1 = 0.254829592;
    let a2 = -0.284496736;
    let a3 = 1.421413741;
    let a4 = -1.453152027;
    let a5 = 1.061405429;
    let p = 0.3275911;
  
    // A&S formula 7.1.26
    let t = 1.0/(1.0 + p*x);
    let y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y; // erf(-x) = -erf(x);
}

function CDFBetween(lowBound,highBound, mean, variance){
    // Since the normal distribution is symmetrical, we want to double this, as the cut will only get one tail.
    return 2 * (cdf(highBound, mean, variance) - cdf(lowBound, mean, variance));
}

module.exports = {
    CDFBetween
}