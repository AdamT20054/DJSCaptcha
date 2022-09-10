const {Client, GuildMember, EmbedBuilder, ChannelType} = require("discord.js");
const EventEmitter = require("events");
const createCaptcha = require("../utils/createCaptcha.cjs");
const handleChannelType = require("../utils/handleChannelType.cjs");

/**
 * @typedef {Object} CaptchaImageData
 * @prop {Buffer} image The CAPTCHA Image.
 * @prop {String} text The Answer to the CAPTCHA.
 */

/**
 * Captcha Options
 * @typedef {Object} CaptchaOptions
 * @prop {String} [roleID=undefined] (OPTIONAL): The ID of the Discord Role to Give when the CAPTCHA is complete.
 * @prop {String} [channelID=undefined] (OPTIONAL): The ID of the Discord Text Channel to Send the CAPTCHA to if the user's Direct Messages are locked. Use the option "sendToTextChannel", and set it to "true" to always send the CAPTCHA to the Text Channel.
 * @prop {Boolean} [sendToTextChannel=false] (OPTIONAL): Whether you want the CAPTCHA to be sent to a specified Text Channel instead of Direct Messages, regardless of whether the user's DMs are locked. Use the option "channelID" to specify the Text Channel.
 * @prop {Boolean} [addRoleOnSuccess=true] (OPTIONAL): Whether you want the Bot to Add the role to the User if the CAPTCHA is Solved Successfully.
 * @prop {Boolean} [kickOnFailure=true] (OPTIONAL): Whether you want the Bot to Kick the User if the CAPTCHA is Failed.
 * @prop {Boolean} [caseSensitive=true] (OPTIONAL): Whether you want the CAPTCHA to be case-sensitive.
 * @prop {Number} [attempts=1] (OPTIONAL): The Number of Attempts Given to Solve the CAPTCHA.
 * @prop {Number} [timeout=60000] (OPTIONAL): The Time in Milliseconds before the CAPTCHA expires and the User fails the CAPTCHA.
 * @prop {Boolean} [showAttemptCount=true] (OPTIONAL): Whether you want to show the Attempt Count in the CAPTCHA Prompt. (Displayed in Embed Footer)
 * @prop {EmbedBuilder} [customPromptEmbed=undefined] (OPTIONAL): Custom Discord Embed to be Shown for the CAPTCHA Prompt.
 * @prop {EmbedBuilder} [customSuccessEmbed=undefined] (OPTIONAL): Custom Discord Embed to be Shown for the CAPTCHA Success Message.
 * @prop {EmbedBuilder} [customFailureEmbed=undefined] (OPTIONAL): Custom Discord Embed to be Shown for the CAPTCHA Failure Message.
 *
 */

class Captcha extends EventEmitter {

    /**
     * Creates a new instance of the Captcha Class
     *
     * __Captcha Options__
     *
     * - `roleAddID` - The role ID to add to the user when they complete the captcha
     *
     * - `roleRemoveID` - The role ID to remove from the user when they fail to complete the captcha
     *
     * - `channelID` - The channel ID to send the captcha to
     *
     * - `sendToTextChannel` - Whether to send the captcha to a text channel or a DM
     **
     * - `addRoleOnSuccess` - Whether to add the role to the user when they complete the captcha
     *
     * - `removeRoleOnSuccess` - Whether to remove the role from the user when they complete the captcha
     *
     * - `kickOnFailure` - Whether to kick the user when they fail to complete the captcha
     *
     * - `kickIfRoleAdded` - Whether to kick the user if they have the role added to them without the captcha being completed
     *
     * - `kickIfRoleRemoved` - Whether to kick the user if they have the role removed from them without the captcha being completed
     *
     * - `caseSensitive` - Whether the captcha responses are case-sensitive
     *
     * - `attempts` - The number of attempts before the captcha is considered to be failed
     *
     * - `timeout` - The time the user has to solve the captcha on each attempt in milliseconds
     *
     * - `showAttemptCount` - Whether to show the number of attempts left in the embed footer
     *
     * - `customPromptEmbed` - The embed to send to the user when they request the captcha
     *
     * - `customSuccessEmbed` - The embed to send to the user when they complete the captcha
     *
     * - `customFailureEmbed` - The embed to send to the user when they fail to complete the captcha
     *
     * @param {CaptchaOptions} options The Options for the Captcha.
     * @param {Client} client The Discord Client.
     * @param {CaptchaOptions} options
     * @example
     * const { Client, IntentsBitField, EmbedBuilder } = require("discord.js");
     * const client = new Client({
     *    intents: [
     *        IntentsBitField.Flags.Guilds,
     *        IntentsBitField.Flags.GuildMessages,
     *        IntentsBitField.Flags.MessageContent, //IMPORTANT: make sure you enable "Message Content Intent" in the dev portal if you do not want to use Interactions!
     *        IntentsBitField.Flags.GuildMembers,
     *        IntentsBitField.Flags.DirectMessages,
     *    ]
     * });
     *
     * const { Captcha } = require("discord.js-captcha");
     *
     * const captcha = new Captcha(client, {
     *     roleAddID: "Role ID Here", // [Optional if addRoleOnSuccess = false] The ID of the role to add to the user.
     *     roleRemoveID: "Role ID Here", // [Optional if removeRoleOnSuccess = false] The ID of the role to remove from the user.
     *     channelID: "Text Channel ID Here", // [Optional if sendToTextChannel = false] The ID of the channel to send the CAPTCHA to.
     *     sendToTextChannel: false, // [Optional | defaults to false] Whether to send the CAPTCHA to a text channel.
     *     addRoleOnSuccess: true, [Optional | defaults to true] Whether you want the bot to add the role to the user if the captcha is solved.
     *     removeRoleOnSuccess: true, [Optional | defaults to true] Whether you want the bot to remove the role from the user if the captcha is solved.
     *     kickOnFailure: true, // [Optional | defaults to false] Whether you want the bot to kick the user if the captcha is failed. Kicks happen 7.5seconds after the captcha is failed.
     *     kickIfRoleAdded: false, // [Optional | defaults to false | kickOnFailure must be true] Whether to kick the user if they have the role added to them without the captcha being completed. This MUST be set to false for manual verification to work.
     *     kickIfRoleRemoved: false, // [Optional | defaults to false | kickOnFailure must be true] Whether to kick the user if they have the role removed from them without the captcha being completed. This MUST be set to false for manual verification to work.
     *     caseSensitive: true, // [Optional | defaults to true] Whether you want the captcha responses to be case-sensitive.
     *     attempts: 3, // [Optional | defaults to 3] The number of attempts before captcha is considered to be failed.
     *     timeout: 30000, // [Optional | defaults to 60000] The time the user has to solve the captcha on each attempt in milliseconds.
     *     showAttemptCount: true, // [Optional | defaults to true] Whether to show the number of attempts left in embed footer.
     *     customPromptEmbed: new EmbedBuilder() // [Optional] Customise the embed that will be sent
     *             .setTitle(`Welcome to ${member.guild.name}!`)
     *             .addFields({
     *                 name: "I'm Not a Robot",
     *                 value: `${member.user}, to gain access to **${member.guild.name}**, please solve the CAPTCHA below!\n\nThis is done to protect the server from raids consisting of spam bots.`
     *             })
     *             .setColor('#0099ff') // Set a custom color for the Prompt Embed
     *             .setThumbnail(member.guild.iconURL({dynamic: true})),
     *      customSuccessEmbed: new EmbedBuilder() // [Optional] Customise the embed that will be sent
     *             .setTitle("✅ CAPTCHA Solved!")
     *             .setDescription(`${member.user}, you completed the CAPTCHA successfully, and you have been given access to **${member.guild.name}**!`)
     *             .setTimestamp()
     *             .setColor('#29ff00')
     *             .setColor(Colors.Aqua)
     *             .setThumbnail(member.guild.iconURL({dynamic: true})),
     *      customFailureEmbed: new EmbedBuilder() // [Optional] Customise the embed that will be sent
     *             .setTitle("❌ You Failed to Complete the CAPTCHA!")
     *             .setDescription(`${member.user}, you failed to solve the CAPTCHA!`)
     *             .setTimestamp()
     *             .setColor('#c71515')
     *             .setThumbnail(member.guild.iconURL({dynamic: true})),
     * });
     */
    constructor(client, options = {}) {
        super();

        setTimeout(() => {
            const version = Number(process.version.split('.')[0].replace('v', ''));
            if (version < 16) return console.log('\n\nPlease upgrade to Node v16 or higher to use this DiscordJS V14 module.\n Download: https://nodejs.org/en/download/\n\n Facing issues? Open an issue here: https://github.com/AdamT20054/DJSCaptcha/issues\n Github: https://github.com/AdamT20054/DJSCaptcha');
        }, 8000);

        if (!client) {
            console.log(`[Captcha] No client provided`);
            process.exit(1);
        }
        this.client = client;
        /**
         * Captcha Options
         * @type {CaptchaOptions}
         */
        this.options = options;

        if (options.guildID) {
            console.warn(`[Captcha] The guildID option is deprecated as of v1.3.2! Remove the guildID line from your captcha options to clear this warning.`);
        }

        if ((options.sendToTextChannel === true) && (!options.channelID)) {
            console.log(`[Captcha] No channel ID provided`);
            process.exit(1);
        }

        if ((options.addRoleOnSuccess === true) && (!options.roleAddID)) {
            console.log(`[Captcha] No role ID to add provided`);
            process.exit(1);
        }

        if ((options.removeRoleOnSuccess === true) && (!options.roleRemoveID)) {
            console.log(`[Captcha] No role ID to remove provided`);
            process.exit(1);
        }

        if ((options.kickIfRoleAdded === true) && (!options.roleAddID)) {
            console.log(`[Captcha] No role ID to add provided for kickIfRoleAdded. Defaulting to false`);
            options.kickIfRoleAdded = false;
        }

        if ((options.kickIfRoleRemoved === true) && (!options.roleRemoveID)) {
            console.log(`[Captcha] No role ID to remove provided for kickIfRoleRemoved. Defaulting to false`);
            options.kickIfRoleRemoved = false;
        }

        if (options.attempts < 1) {
            console.log(`Discord.js Captcha Error: Option "attempts" must be Greater than 0!\nNeed Help? Join our Discord Server at 'https://discord.gg/P2g24jp'`);
            process.exit(1)
        }
        if (options.timeout < 1) {
            console.log(`Discord.js Captcha Error: Option "timeout" must be Greater than 0!\nNeed Help? Join our Discord Server at 'https://discord.gg/P2g24jp'`);
            process.exit(1)
        }
        if (options.attempts < 1) {
            console.log(`[Captcha] Attempts must be greater than 0`);
            process.exit(1);
        }

        if (options.timeout < 1) {
            console.log(`[Captcha] Invalid timeout provided`);
            process.exit(1);
        }

        if (options.caseSensitive && (typeof options.caseSensitive !== "boolean")) {
            console.log(`[Captcha] 'CaseSensitive' must be a boolean value`);
            process.exit(1);
        }

        if (options.customPromptEmbed && (typeof options.customPromptEmbed === "string")) {
            console.log(`[Captcha] Invalid instance of MessageEmbed provided for 'customPromptEmbed'`);
            process.exit(1);
        }

        if (options.customSuccessEmbed && (typeof options.customSuccessEmbed === "string")) {
            console.log(`[Captcha] Invalid instance of MessageEmbed provided for 'customSuccessEmbed'`);
            process.exit(1);
        }

        if (options.customFailureEmbed && (typeof options.customFailureEmbed === "string")) {
            console.log(`[Captcha] Invalid instance of MessageEmbed provided for 'customFailureEmbed'`);
            process.exit(1);
        }

        if (options.addRoleOnSuccess === undefined) {
            console.log(`[Captcha] No 'addRoleOnSuccess' option provided, defaulting to true`);
            options.addRoleOnSuccess = true;
        }

        if (options.removeRoleOnSuccess === undefined) {
            console.log(`[Captcha] No 'removeRoleOnSuccess' option provided, defaulting to false`);
            options.removeRoleOnSuccess = false;
        }

        options.attempts = options.attempts || 3;

        if (options.caseSensitive === undefined) {
            console.log(`[Captcha] No 'caseSensitive' option provided, defaulting to true`);
            options.caseSensitive = true;
        }

        options.timeout = options.timeout || 60000;

        if (options.showAttemptCount === undefined) {
            console.log(`[Captcha] No 'showAttemptCount' option provided, defaulting to true`);
            options.showAttemptCount = true;
        }

        Object.assign(this.options, options);
    }

    /**
     * Presents the CAPTCHA to a `Discord.GuildMember`.
     *
     * @param {GuildMember} member The Discord Server Member to Present the CAPTCHA to.
     * @param {CaptchaImageData} [customCaptcha=undefined] **(OPTIONAL):** An object consisting of a Custom CAPTCHA Image and Text Answer.
     * @returns {Promise<Boolean>} Whether or not the Member Successfully Solved the CAPTCHA.
     * @async
     * @example
     * const { Captcha } = require("discord.js-captcha");
     *
     * const captcha = new Captcha(client, {
     *     roleAddID: "Role ID Here", // [Optional if addRoleOnSuccess = false] The ID of the role to add to the user.
     *     roleRemoveID: "Role ID Here", // [Optional if removeRoleOnSuccess = false] The ID of the role to remove from the user.
     *     channelID: "Text Channel ID Here", // [Optional if sendToTextChannel = false] The ID of the channel to send the CAPTCHA to.
     *     sendToTextChannel: false, // [Optional | defaults to false] Whether to send the CAPTCHA to a text channel.
     *     addRoleOnSuccess: true, [Optional | defaults to true] Whether you want the bot to add the role to the user if the captcha is solved.
     *     removeRoleOnSuccess: true, [Optional | defaults to true] Whether you want the bot to remove the role from the user if the captcha is solved.
     *     kickOnFailure: true, // [Optional | defaults to false] Whether you want the bot to kick the user if the captcha is failed. Kicks happen 7.5seconds after the captcha is failed.
     *     kickIfRoleAdded: false, // [Optional | defaults to false | kickOnFailure must be true] Whether to kick the user if they have the role added to them without the captcha being completed. This MUST be set to false for manual verification to work.
     *     kickIfRoleRemoved: false, // [Optional | defaults to false | kickOnFailure must be true] Whether to kick the user if they have the role removed from them without the captcha being completed. This MUST be set to false for manual verification to work.
     *     caseSensitive: true, // [Optional | defaults to true] Whether you want the captcha responses to be case-sensitive.
     *     attempts: 3, // [Optional | defaults to 3] The number of attempts before captcha is considered to be failed.
     *     timeout: 30000, // [Optional | defaults to 60000] The time the user has to solve the captcha on each attempt in milliseconds.
     *     showAttemptCount: true, // [Optional | defaults to true] Whether to show the number of attempts left in embed footer.
     *     customPromptEmbed: new EmbedBuilder() // [Optional] Customise the embed that will be sent
     *             .setTitle(`Welcome to ${member.guild.name}!`)
     *             .addFields({
     *                 name: "I'm Not a Robot",
     *                 value: `${member.user}, to gain access to **${member.guild.name}**, please solve the CAPTCHA below!\n\nThis is done to protect the server from raids consisting of spam bots.`
     *             })
     *             .setColor('#0099ff') // Set a custom color for the Prompt Embed
     *             .setThumbnail(member.guild.iconURL({dynamic: true})),
     *      customSuccessEmbed: new EmbedBuilder() // [Optional] Customise the embed that will be sent
     *             .setTitle("✅ CAPTCHA Solved!")
     *             .setDescription(`${member.user}, you completed the CAPTCHA successfully, and you have been given access to **${member.guild.name}**!`)
     *             .setTimestamp()
     *             .setColor('#29ff00')
     *             .setColor(Colors.Aqua)
     *             .setThumbnail(member.guild.iconURL({dynamic: true})),
     *      customFailureEmbed: new EmbedBuilder() // [Optional] Customise the embed that will be sent
     *             .setTitle("❌ You Failed to Complete the CAPTCHA!")
     *             .setDescription(`${member.user}, you failed to solve the CAPTCHA!`)
     *             .setTimestamp()
     *             .setColor('#c71515')
     *             .setThumbnail(member.guild.iconURL({dynamic: true})),
     * });
     *
     * client.on("guildMemberAdd", async member => {
     *     captcha.present(member);
     * });
     */
    async present(member, customCaptcha) {
        if (!member) {
            return console.log(`[Captcha] No member provided`);
        }


        if (customCaptcha) {
            if (!customCaptcha.image) {
                return console.log(`Captcha Error: Custom Captcha Image Data does not include an Image Buffer!\nNeed help? Open an issue at https://github.com/AdamT20054/DJSCaptcha/issues`);
            }
            if (!customCaptcha.text) {
                return console.log(`Captcha Error: Custom Captcha Image Data does not include a Text Answer!\nNeed help? Open an issue at https://github.com/AdamT20054/DJSCaptcha/issues`);
            }
            if (!Buffer.isBuffer(customCaptcha.image)) {
                return console.log(`Captcha Error: Custom Captcha Image is not a Buffer!\nNeed help? Open an issue at https://github.com/AdamT20054/DJSCaptcha/issues`);
            }
            if (typeof customCaptcha.text !== "string") {
                return console.log(`Captcha Error: Custom Captcha Text is not of type String!\nNeed help? Open an issue at https://github.com/AdamT20054/DJSCaptcha/issues`);
            }
        }
        const user = member.user;

        // Construct the Captcha
        const captcha = customCaptcha ? customCaptcha : await createCaptcha(6, this.options.caseSensitive ? "" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ").catch(err => {
            console.log(`[Captcha] Error creating CAPTCHA: ${err}`)
        });

        let attemptsLeft = this.options.attempts || 1;
        let attemptsTaken = 1;
        let captchaResponses = [];

        // Construct the default captchaIncorrect embed
        let captchaIncorrect = new EmbedBuilder()
            .setTitle("❌ You Failed to Complete the CAPTCHA!")
            .setDescription(`${member.user}, you failed to solve the CAPTCHA!\n\nCAPTCHA Text: **${captcha.text}**`)
            .setTimestamp()
            .setColor("#ff0000")
            .setThumbnail(member.guild.iconURL({dynamic: true}));

        // If customFailureEmbed, use that instead of the default embed
        if (this.options.customFailureEmbed) {
            captchaIncorrect = this.options.customFailureEmbed;
        }

        // Construct the default captchaCorrect embed
        let captchaCorrect = new EmbedBuilder()
            .setTitle("✅ You Completed the CAPTCHA!")
            .setDescription(`${member.user}, you completed the CAPTCHA successfully! You have been given access to **${member.guild.name}**!`)
            .setTimestamp()
            .setColor("#00ff00")
            .setThumbnail(member.guild.iconURL({dynamic: true}));

        // If customSuccessEmbed, use that instead of the default embed
        if (this.options.customSuccessEmbed) {
            captchaCorrect = this.options.customSuccessEmbed;
        }

        // Construct the default captchaPrompt embed
        let captchaPrompt = new EmbedBuilder()
            .setTitle(`🔐 Welcome to ${member.guild.name}! 🔐`)
            .addFields({
                name: "I'm not a robot",
                value: `${member.user}, to gain access to **${member.guild.name}**, you must solve the CAPTCHA below!\n\nThis is done to prevent bots from accessing the server!`
            })
            .setColor("#00e0ff")
            .setThumbnail(member.guild.iconURL({dynamic: true}))

        if (this.options.customPromptEmbed) {
            captchaPrompt = this.options.customPromptEmbed
        }

        if (this.options.showAttemptCount) {
            captchaPrompt.setFooter({text: this.options.attempts === 1 ? "You have one attempt to solve the CAPTCHA." : `Attempts Left: ${attemptsLeft}`})
        }
        captchaPrompt.setImage('attachment://captcha.png')

        await handleChannelType(this.client, this.options, member).then(async channel => {
            let captchaEmbed;

            try {
                if ((this.options.channelID) && this.options.sendToTextChannel === true) {
                    channel = (await this.client.guilds.fetch(member.guild.id)).channels.resolve(this.options.channelID)
                } else {
                    channel = await user.createDM()
                }

                // Sending the captcha image to the channel.
                // noinspection JSUnresolvedFunction
                captchaEmbed = await channel.send({
                    embeds: [captchaPrompt],
                    files: [
                        {name: "captcha.png", attachment: captcha.image}
                    ]
                })
            } catch {
                // Fetching the guild and channel ID's from options
                // noinspection JSUnresolvedVariable
                channel = (await this.client.guilds.fetch(member.guild.id)).channels.resolve(this.options.channelID)
                if (this.options.channelID) {
                    // Sending the captcha to the channel.
                    captchaEmbed = await channel.send({
                        embeds: [captchaPrompt],
                        files: [
                            {name: "captcha.png", attachment: captcha.image}
                        ]
                    })
                } else {
                    return console.log(`[Captcha] Error sending CAPTCHA for ${user.tag} \nYou can attempt have the CAPTCHA sent to a Text Channel if it can't send to DMs by using the "channelID" Option in the Constructor.\nNeed Help? Open an issue at https://github.com/AdamT20054/DJSCaptcha/issues`);
                }
            }

            // Filtering the messages in the channel to only those that are sent by the user who is being verified.
            const captchaFilter = x => {
                return (x.author.id === member.user.id)
            }

            /**
             * It takes a captchaData object, and then it awaits a message from the user, and then it checks if the message
             * is correct, and if it is, it does stuff, and if it isn't, it does other stuff
             * @param captchaData - This is the object that is passed to the captcha function.
             */

            async function handleAttempt(captchaData) { //Handles CAPTCHA Responses and Checks
                await captchaEmbed.channel.awaitMessages({
                    // Await a message from the user.
                    filter: captchaFilter, max: 1, time: captchaData.options.timeout
                })
                    .then(async responses => {
                        // Checking if the message is correct.

                        // Checking if the user has responded to the captcha. If they have not responded, it will kick them from the server.
                        if (!responses.size) { //If no response was given, CAPTCHA is fully cancelled here

                            //emit timeout event
                            captchaData.emit("timeout", {
                                member: member,
                                responses: captchaResponses,
                                attempts: attemptsTaken,
                                captchaText: captcha.text,
                                captchaOptions: captchaData.options
                            })

                            captchaEmbed.delete({
                                reason: "Captcha Timeout"
                            });

                            await channel.send({
                                embeds: [captchaIncorrect]
                            }).then(async msg => {
                                console.log(`[Captcha] ${member.user.tag} failed to solve the CAPTCHA in time!`)
                                // wait 7.5 seconds, then delete the message

                                if (captchaData.options.kickOnFailure) {
                                    // if user has addRoleID role equipped, then they will be kicked
                                    if ((member.roles.cache.some(role => role.id === captchaData.options.roleAddID) && (captchaData.options.kickIfRoleAdded)) || ((member.roles.cache.some(role => role.id === captchaData.options.roleRemoveID)) && (!(captchaData.options.kickIfRoleRemoved)))) {
                                        setTimeout(() => member.kick({
                                            reason: `Failed to pass CAPTCHA`
                                        }, 7500));
                                    }
                                }

                                if (channel.type === ChannelType.GuildText) {
                                    setTimeout(() => msg.delete({
                                        reason: "Captcha Timeout"
                                    }), 7500);

                                }
                            })
                            return false;
                        }

                        //emit answer event
                        captchaData.emit("answer", {
                            member: member,
                            response: String(responses.first()),
                            attempts: attemptsTaken,
                            captchaText: captcha.text,
                            captchaOptions: captchaData.options
                        })

                        let answer = String(responses.first()); //Converts the response message to a string

                        if (captchaData.options.caseSensitive !== true) {
                            answer = answer.toLowerCase();
                        } //If the CAPTCHA is case-sensitive, convert the response to lowercase

                        captchaResponses.push(answer); //Adds the answer to the array of answers

                        if (channel.type === ChannelType.GuildText) {
                            await responses.first().delete();
                        }

                        if (answer === captcha.text) { //If the answer is correct, this code will execute
                            //emit success event
                            captchaData.emit("success", {
                                member: member,
                                responses: captchaResponses,
                                attempts: attemptsTaken,
                                captchaText: captcha.text,
                                captchaOptions: captchaData.options
                            })

                            // Adding a role to the user if they pass the captcha and addRoleOnSuccess is true.
                            if (captchaData.options.addRoleOnSuccess) {

                                try {
                                    await member.roles.add(captchaData.options.roleAddID, 'Passed the CAPTCHA');
                                } catch (err) {
                                    console.log(`[Captcha] Error adding role to ${member.user.tag}`);
                                }
                            }

                            if (captchaData.options.removeRoleOnSuccess) {
                                try {
                                    await member.roles.remove(captchaData.options.roleRemoveID, 'Passed the CAPTCHA');
                                } catch (err) {

                                    console.log(`[Captcha] Error removing role from ${member.user.tag}`);
                                }
                            }

                            if (channel.type === ChannelType.GuildText) {
                                await captchaEmbed.delete({
                                    reason: `Deleting from Captcha timeout`
                                });
                            }

                            channel.send({
                                embeds: [captchaCorrect]
                            }).then(async msg => {
                                if (channel.type === ChannelType.GuildText) {
                                    setTimeout(() => msg.delete({
                                        reason: "Deleting CAPTCHA Success Message"
                                    }), 7500);
                                }
                            });
                            return true;
                        } else { //If the answer is incorrect, this code will execute
                            if (attemptsLeft > 1) { //If there are attempts left
                                // If the user has more than one attempt left, it will send a new captcha.
                                attemptsLeft--;
                                attemptsTaken++;
                                if (channel.type === ChannelType.GuildText && captchaData.options.showAttemptCount) {
                                    await captchaEmbed.edit({
                                        embeds: [
                                            captchaPrompt.setFooter({
                                                text: `Attempts Left: ${attemptsLeft}`
                                            })],
                                        files: [{
                                            name: "captcha.png",
                                            attachment: captcha.image
                                        }]
                                    })
                                } else if (channel.type !== ChannelType.GuildText) {
                                    await captchaEmbed.channel.send({
                                        embeds: [
                                            captchaData.options.showAttemptCount ? captchaPrompt.setFooter({
                                                text: `Attempts Left: ${attemptsLeft}`
                                            }) : captchaPrompt],
                                        files: [{
                                            name: "captcha.png",
                                            attachment: captcha.image
                                        }]
                                    })
                                }
                                return handleAttempt(captchaData);
                            }
                            //If there are no attempts left

                            //emit failure event
                            captchaData.emit("failure", {
                                member: member,
                                responses: captchaResponses,
                                attempts: attemptsTaken,
                                captchaText: captcha.text,
                                captchaOptions: captchaData.options
                            })

                            if (channel.type === ChannelType.GuildText) {
                                await captchaEmbed.delete({
                                    reason: "Deleting CAPTCHA Message"
                                });


                            }

                            await channel.send({
                                embeds: [captchaIncorrect]
                            }).then(async msg => {
                                setTimeout(() => msg.delete({
                                    reason: "Deleting incorrect captcha"
                                }), 7500);
                                // if kickOnFailure is true, it will kick the user.
                                if (captchaData.options.kickOnFailure) {
                                    // Fetch the member
                                    console.log(captchaData.options.roleAddID);
                                    console.log((member.roles.cache.some(role => role.id === captchaData.options.roleAddID)));
                                    console.log((member.roles.cache.some(role => role.id === captchaData.options.roleRemoveID)))
                                    // If user had RoleAddID and KickIfRoleAdded is true, it will kick the user.
                                    if ( (member.roles.cache.some(role => role.id === captchaData.options.roleAddID) && (captchaData.options.kickIfRoleAdded)) || ((member.roles.cache.some(role => role.id === captchaData.options.roleRemoveID)) && (!(captchaData.options.kickIfRoleRemoved)))) {
                                        console.log(`test`)
                                        if (channel.type === ChannelType.GuildText) {
                                            setTimeout(() => msg.delete({
                                                reason: "Deleting from Captcha timeout"
                                            }), 7500);
                                        }
                                        setTimeout(() => member.kick({
                                            reason: "Failed to pass CAPTCHA"
                                        }), 7500);

                                    }
                                }

                            });
                            return false;
                        }
                    })
            }

            //emit prompt event
            this.emit("prompt", {
                member: member,
                captchaText: captcha.text,
                captchaOptions: this.options
            })
            await handleAttempt(this);
        })
    }
}

module.exports = Captcha;

// TODO: Update the if statment to properly check whether they need to be kicked or not. Atm doesn't do anyone without a role if kickIfRoleAdded is false.