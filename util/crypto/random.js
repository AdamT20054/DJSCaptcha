const crypto = require('crypto').webcrypto;


/* Generating a cryptographically secure random number between 0 and 1. */
module.exports = async function random() {
    let arr = new Uint32Array(2);
    crypto.getRandomValues(arr);

    let mantissa = (arr[0] * Math.pow(2,20)) + (arr[1] >>> 12)

    return mantissa * Math.pow(2, -52);
}
