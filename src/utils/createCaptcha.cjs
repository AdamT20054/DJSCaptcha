const shuffle = require(`../../util/lodash/shuffle.js`);
const random = require(`../../util/crypto/random.js`);

/**
 * Asynchronously Generates a CAPTCHA.
 * @param {Number} [length=6] The Text Length of the CAPTCHA. Defaults to 6.
 * @param {String} [blacklist=""] A List of Characters to Exclude from the CAPTCHA.
 * @returns {CaptchaImageData} The CAPTCHA Image Data.
 */

module.exports = async function createCaptcha(length = 6, blacklist = "") {

    // Check to see if Canvas is installed.
    try {
        require("canvas")
    } catch { throw new Error("Captcha Generation Error: Automatic CAPTCHA Creation requires the 'canvas' library to be installed.\n You can follow these instructions to install Canvas: https://github.com/AdamT20054/DJSCaptcha/tree/Interactions#presenting-a-captcha-to-a-member-with-built-in-captcha-creation") }
    const { Canvas } = require("canvas");

    // Validate length param
    if (Number.isNaN(length)) throw new Error("Captcha Generation Error: Length must be a Number.");
    if (length < 1) throw new Error("Captcha Generation Error: The CAPTCHA Length must be at least 1 character.\nNeed help? Open an issue at https://github.com/AdamT20054/DJSCaptcha/issues");

    // Validate blacklist param
    if (typeof blacklist !== "string") throw new Error("Captcha Generation Error: The blacklist parameter must be a string.\nNeed help? Open an issue at https://github.com/AdamT20054/DJSCaptcha/issues");
    if (blacklist.match(/[^a-zA-Z0-9]/)) throw new Error("Captcha Generation Error: The blacklist parameter must only contain alphanumeric characters.\nNeed help? Open an issue at https://github.com/AdamT20054/DJSCaptcha/issues");


    let chars = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9"
    ];

    chars.splice(0, chars.length, ...chars.filter(c => !blacklist.includes(c)));
    chars = await shuffle(chars);


    // Remove blacklisted characters from the character list
    chars.splice(0, chars.length, ...chars.filter(c => !blacklist.includes(c)));
    chars = await shuffle(chars);

    const canvas = new Canvas(400, 250);
    const ctx = canvas.getContext("2d");

    // Set background color
    ctx.globalAlpha = 1;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.fillRect(0, 0, 400, 250);
    ctx.save();

    // Set style for lines
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;

    // Draw lines
    ctx.beginPath();

    const coords = [];

    for (let i = 0; i < 4; i++) {
        if (!coords[i])
            coords[i] = [];
        for (let j = 0; j < 5; j++)
            coords[i][j] = Math.round(await random() * 80) + j * 80;
        if (!(i % 2))
            coords[i] = await shuffle(coords[i]);
    }

    for (let i = 0; i < coords.length; i++) {
        if (!(i % 2)) {
            for (let j = 0; j < coords[i].length; j++) {
                if (!i) {
                    ctx.moveTo(coords[i][j], 0);
                    ctx.lineTo(coords[i + 1][j], 400);
                }
                else {
                    ctx.moveTo(0, coords[i][j]);
                    ctx.lineTo(400, coords[i + 1][j]);
                }
            }
        }
    }

    ctx.stroke();

    // Set style for circles
    ctx.fillStyle = "#000";
    ctx.line400 = 0;

    // Draw circles
    for (let i = 0; i < 200; i++) {
        ctx.beginPath();
        ctx.arc(Math.round(await random() * 360) + 20, Math.round(await random() * 360) + 20, Math.round(await random() * 7) + 1, 0, Math.PI * 2);
        ctx.fill();
    }

    // generate text
    let text = "";
    for (let i = 0; i < length; i++) text += chars[Math.floor(await random() * chars.length)];


    // Set style for text based on length param
    ctx.font = `${length > 6 ? (80 / (length / 7.5)) : 80}px Sans`;
    ctx.fillStyle = "#000";


    // Set position for text
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.translate(0, 250);
    ctx.translate(Math.round(await random() * 100 - 50) + 200, -1 * Math.round(await random() * (250 / 4) - 250 / 8) - 250 / 2);
    ctx.rotate(await random() - 0.5);

    // Set text value and print it to canvas
    ctx.beginPath();
    ctx.fillText(text, 0, 0);

    // Draw foreground noise
    ctx.restore();

    for (let i = 0; i < 5000; i++) {

        ctx.beginPath();

        let color = "#";
        while (color.length < 7) {
            color += Math.round(await random() * 16).toString(16);
        }

        color += "a0";
        ctx.fillStyle = color;
        ctx.arc(Math.round(await random() * 400), Math.round(await random() * 250), await random() * 2, 0, Math.PI * 2);
        ctx.fill();
    }

    return {
        image: canvas.toBuffer(),
        text: text
    };
}