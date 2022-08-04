// https://github.com/lodash/lodash/blob/master/.internal/copyArray.js

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
module.exports = function copyArray(source, array) {
    let index = -1
    const length = source.length

    array || (array = new Array(length))
    while (++index < length) {
        array[index] = source[index]
    }
    return array
}

