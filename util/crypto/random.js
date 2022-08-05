const crypto = require('crypto').webcrypto;


/* Generating a cryptographically secure random number between 0 and 1. */
module.exports = async function random() {
    let arr = new Uint32Array(2);
    crypto.getRandomValues(arr);

// keep all 32 bits of the first, top 20 of the second for 52 random bits
    let mantissa = (arr[0] * Math.pow(2,20)) + (arr[1] >>> 12)

// shift all 52 bits to the right of the decimal point
    return mantissa * Math.pow(2, -52);
}
