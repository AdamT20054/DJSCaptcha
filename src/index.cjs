/* It creates a captcha, sends it to the user, and then checks if the user's response is correct */
const { EmbedBuilder, GuildMember } = require('discord.js');
const EventEmitter = require("events");
const createCaptcha = require("./createCaptcha.cjs");
const handleChannelType = require("./handleChannelType.cjs");


/**
 *
 * Captcha Options
 * @typedef {object} CaptchaOptions
 * @property {string} [roleAddID=undefined] - The role ID to add to the user when they complete the captcha
 * @property {string} [roleRemoveID=undefined] - The role ID to remove from the user when they fail to complete the captcha
 * @property {string} [channelID=undefined] - The channel ID to send the captcha to
 * @property {boolean} [sendToTextChannel=false] - Whether to send the captcha to a text channel or a DM
 * @property {boolean} [addRoleOnSuccess=true] - Whether to add the role to the user when they complete the captcha
 * @property {boolean} [removeRoleOnSuccess=false] - Whether to remove the role from the user when they complete the captcha
 * @property {boolean} [kickOnFailure=false] - Whether to kick the user when they fail to complete the captcha
 * @property {boolean} [kickIfRoleAdded=false] - Whether to kick the user if they have the role added when they fail to complete the captcha
 * @property {boolean} [kickIfRoleRemoved=false] - Whether to kick the user if they have the role removed when they fail to complete the captcha
 * @property {boolean} [caseSensitive=true] - Whether the captcha responses are case sensitive
 * @property {number} [attempts=3] - The number of attempts before the captcha is considered to be failed
 * @property {number} [timeout=60000] - The time the user has to solve the captcha on each attempt in milliseconds
 * @property {boolean} [showAttemptCount=true] - Whether to show the number of attempts left in the embed footer
 * @property {EmbedBuilder} [customPromptEmbed=undefined] - The embed to send to the user when they request the captcha
 * @property {EmbedBuilder} [customSuccessEmbed=undefined] - The embed to send to the user when they complete the captcha
 * @property {EmbedBuilder} [customFailureEmbed=undefined] - The embed to send to the user when they fail to complete the captcha
 */

class Captcha extends EventEmitter {

    /**
     * Creates a new instance of the Captcha Class
     *
     * __Captcha Options__
     * @param {CaptchaOptions} options - The options to create the captcha with
     * @param {Discord.Client} client - The client to create the captcha with
     *
     **
     * - `roleAddID` - The role ID to add to the user when they complete the captcha
     *
     * - `roleRemoveID` - The role ID to remove from the user when they fail to complete the captcha
     *
     * - `channelID` - The channel ID to send the captcha to
     *
     * - `sendToTextChannel` - Whether to send the captcha to a text channel or a DM
     *
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
     */

    // /**
    //  * It's a constructor function that takes in a client and options, and then it sets the client and options to the class
    //  * @param {Client} client - The Discord.js client
    //  * @param {CaptchaOptions} options
    //  */
    constructor(client, options = {}) {
        super();
        
        setTimeout(() => {
            const version = Number(process.version.split('.')[0].replace('v', ''));
            if (version < 16) return console.log('\n\nPlease upgrade to Node v16 or higher to use this DiscordJS V14 module.\n Download: https://nodejs.org/en/download/\n\n Facing issues? Open an issue here: https://github.com/AdamT20054/DJSCaptcha/issues\n Github: https://github.com/AdamT20054/DJSCaptcha');
        }, 8000);

        if(!client) {
            console.log(`[Captcha] No client provided`);
            process.exit(1);
        }

       this.client = client;

        /**
         * Captcha Options
         * @type {CaptchaOptions}
         */
        this.options = options;

        if(options.guildID) {
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

        if((options.kickIfRoleAdded === true) && (!options.roleAddID)) {
            console.log(`[Captcha] No role ID to add provided for kickIfRoleAdded. Defaulting to false`);
            options.kickIfRoleAdded = false;
        }

        if((options.kickIfRoleRemoved === true) && (!options.roleRemoveID)) {
            console.log(`[Captcha] No role ID to remove provided for kickIfRoleRemoved. Defaulting to false`);
            options.kickIfRoleRemoved = false;
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

        options.attempts = options.attempts || 1;

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
     * Presents the CAPTCHA to the user
     *
     * __Note__: The CAPTCHA will be sent in DMs if `sendToTextChannel` is set to `false`, if the user has DMs disabled it will be sent in channelID if provided and deleted after the timeout
     *
     * @param {GuildMember} member - The Discord Server Member to present the CAPTCHA to
     * @returns {Promise<void>} - Whether the member completed the CAPTCHA or not
     */

    async present(member) {
        //Checking if the member is provided.
        if (!member) {
            return console.log(`[Captcha] No member provided`);
        }

        const user = member.user;

        //Creating a captcha.
        const captcha = await createCaptcha(this.options.caseSensitive).catch(err => {
            console.log(`[Captcha] Error creating captcha: ${err}`);
            return false;
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
            .setThumbnail(member.guild.iconURL({ dynamic: true }));

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
            .setThumbnail(member.guild.iconURL({ dynamic: true }));

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

        // If customPromptEmbed, use that instead of the default embed
        if (this.options.customPromptEmbed) {
            captchaPrompt = this.options.customPromptEmbed
        }

        // If showAttemptCount is true, add the attempt count to the prompt footer
        if (this.options.showAttemptCount) {
            captchaPrompt.setFooter({
                text: this.options.attempts === 1 ? "You have one attempt to solve the CAPTCHA." : `Attempts Left: ${attemptsLeft}`
            })
            captchaPrompt.setImage(`attachment://captcha.png`);
        }

        // Handling the captcha.
        // noinspection JSUnresolvedFunction
        await handleChannelType(this.client, this.options, user).then(async channel => {
            let captchaEmbed;


            try {
                // Checking if the channelID is set and if the sendToTextChannel is set to true. If it is, it will fetch the channelID and resolve it. If not, it will create a DM.
                if ((this.options.channelID) && this.options.sendToTextChannel === true) {
                    // noinspection JSUnresolvedVariable
                    channel = (await this.client.channels.fetch(this.options.channelID)).channels.resolve(this.options.channelID)
                } else {
                    channel = await user.createDM()
                }


                // Sending the captcha image to the channel.
                // noinspection JSUnresolvedFunction
                captchaEmbed = await channel.send({
                    embeds: [captchaPrompt],
                    files: [{
                        name: "captcha.png", attachment: captcha.image
                    }]
                })
            }
            catch {
                // Fetching the guild and channel ID's from options
                // noinspection JSUnresolvedVariable
                channel = (await this.client.guilds.fetch(member.guild.id)).channels.resolve(this.options.channelID);
                if (this.options.channelID) {
                    // Sending the captcha to the channel.
                    captchaEmbed = await channel.send({
                        embeds: [captchaPrompt],
                        files: [{
                            name: "captcha.png", attachment: captcha.image
                        }]
                    })
                } else {
                    console.log(`[Captcha] Error sending CAPTCHA for ${user.tag}`);
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

            async function handleAttempt(captchaData) {
                // Await a message from the user.
                await captchaEmbed.channel.awaitMessages({
                    filter: captchaFilter, max: 1, time: captchaData.options.timeout
                }).then(async responses => {
                    // Checking if the message is correct.

                    // Checking if the user has responded to the captcha. If they have not responded, it will kick them from the server.
                    if (!responses.size) {
                        // No response given

                        captchaData.emit("timeout", {
                            member: member,
                            responses: captchaResponses,
                            attempts: attemptsTaken,
                            captchaText: captcha.text,
                            captchaOptions: captchaData.options
                        })

                        await captchaEmbed.delete({
                            reason: "Captcha Timeout"
                        });
                        await channel.send({
                            embeds: [captchaIncorrect],
                        }).then(async msg => {
                            if (captchaData.options.kickOnFailure) {
                                // if user has addRoleID role equipped, then they will be kicked
                                if ( (member.roles.cache.has(captchaData.options.roleAddID) && (captchaData.options.kickIfRoleAdded) ) || ( (!member.roles.cache.has(captchaData.options.roleRemoveID)) && (captchaData.options.kickIfRoleRemoved) ) ) {
                                    await member.kick({
                                        reason: `Failed to pass CAPTCHA`
                                    });
                                }
                                if((captchaData.options.kickIfRoleRemoved === false) && (captchaData.options.kickIfRoleAdded === false)) {
                                    await member.kick({
                                        reason: `Failed to pass CAPTCHA`
                                    });
                                }
                            }
                            if ((channel.type === "GUILD_TEXT") && (!member.roles.cache.has(captchaData.options.roleAddID))) {
                                setTimeout(() => msg.delete({
                                    reason: `Deleting from Captcha timeout`
                                }), 7500);
                                if((member.roles.cache.has(captchaData.options.roleAddID) && (captchaData.options.kickIfRoleAdded)) || ( (!member.roles.cache.has(captchaData.options.roleRemoveID)) && (captchaData.options.kickIfRoleRemoved) ) ) {

                                    setTimeout(() => member.kick({
                                        reason: "Failed to pass CAPTCHA"
                                    }), 7500);
                                }
                                if((captchaData.options.kickIfRoleRemoved === false) && (captchaData.options.kickIfRoleAdded === false)) {
                                    await member.kick({
                                        reason: `Failed to pass CAPTCHA`
                                    });
                                }
                            }
                        })
                        return false;
                    }

                    captchaData.emit("answer", {
                        member: member,
                        responses: String(responses.first()),
                        attempts: attemptsTaken,
                        captchaText: captcha.text,
                        captchaOptions: captchaData.options
                    })

                    let answer = String(responses.first())
                    if (captchaData.options.caseSensitive !== true) {
                        answer = answer.toLowerCase()
                    }
                    captchaResponses.push(answer);
                    if (channel.type === "GUILD_TEXT") {
                        await responses.first().delete();
                    }

                    // Checking if the answer is correct or not.
                    if (answer === captcha.text) {
                        // Answer is correct.
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
                            }
                            catch (err) {
                                console.log(`[Captcha] Error adding role to ${member.user.tag}`);
                            }
                        }
                        // Removing the role from the user if removeRoleOnSuccess is set to true.
                        if (captchaData.options.removeRoleOnSuccess) {
                            try {
                                await member.roles.remove(captchaData.options.roleRemoveID, 'Passed the CAPTCHA');
                            }
                            catch (err) {

                                console.log(`[Captcha] Error removing role from ${member.user.tag}`);
                            }
                        }

                        if (channel.type === "GUILD_TEXT") {
                            await captchaEmbed.delete();
                        }
                        channel.send({
                            embeds: [captchaCorrect],
                        }).then(async msg => {
                            if (channel.type === "GUILD_TEXT") {
                                setTimeout(() => msg.delete({
                                    reason: "Deleting CAPTCHA Success Message"
                                }), 7500);
                            }

                        })
                        return true;
                    } else {
                        // Answer is incorrect.
                        if (attemptsLeft > 1) {
                            // If the user has more than one attempt left, it will send a new captcha.
                            attemptsLeft--;
                            attemptsTaken++;
                            if (channel.type === "GUILD_TEXT") {
                                // If the channel is in a guild, it will delete the old captcha.
                                await captchaEmbed.edit({
                                    embeds: [captchaPrompt.setFooter({
                                        text: `Attempts Left: ${attemptsLeft}`
                                    })],
                                    fields: [{
                                        name: "captcha.png",
                                        attachment: captcha.image
                                    }]
                                })
                            }
                            if (channel.type !== "GUILD_TEXT") {
                                // If the channel is in a DM, it will send a new captcha.
                                await captchaEmbed.edit({
                                    embeds: [captchaPrompt.setFooter({
                                        text: `Attempts Left: ${attemptsLeft}`
                                    })],
                                    files: [{
                                        name: "captcha.png", attachment: captcha.image
                                    }]
                                })
                            }
                            return handleAttempt(captchaData);
                        }


                        captchaData.emit("failure", {
                            member: member,
                            responses: captchaResponses,
                            attempts: attemptsTaken,
                            captchaText: captcha.text,
                            captchaOptions: captchaData.options
                        })

                        // If the user has no more attempts left, it will kick them.
                        setTimeout(() => member.kick({
                            reason: "Failed to pass CAPTCHA"
                        }), 7500);

                        // If channel is in a guild, it will delete the old captcha.
                        if (channel.type === "GUILD_TEXT") {
                            await captchaEmbed.delete();
                        }

                        // If channel is in a DM, it will send the incorrect embed.
                        await channel.send({
                            embeds: [captchaIncorrect],
                        }).then(async msg => {
                            // if kickOnFailure is true, it will kick the user.
                            if (captchaData.options.kickOnFailure) {
                                if( (member.roles.cache.has(captchaData.options.roleAddID) && (captchaData.options.kickIfRoleAdded) ) || ( (!member.roles.cache.has(captchaData.options.roleRemoveID)) && (captchaData.options.kickIfRoleRemoved) ) ) {
                                    if (channel.type === "GUILD_TEXT") {
                                        setTimeout(() => msg.delete({
                                            reason: "Deleting from Captcha timeout"
                                        }), 7500);
                                        setTimeout(() => member.kick({
                                            reason: "Failed to pass CAPTCHA"
                                        }), 7500);
                                    }
                                }
                            }

                        })
                        return false;

                    }
                })
            }
            // emit prompt event
            this.emit("prompt", {
                member: member,
                captchaText: captcha.text,
                captchaOptions: this.options
            })
            await handleAttempt(this);
        })
    }
}

module.exports.Captcha = Captcha;
