/* It creates a captcha, sends it to the user, and then checks if the user's response is correct */
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ApplicationCommandType, ButtonStyle, Colors, Client, GuildMember } = require('discord.js');
const EventEmitter = require("events");
const createCaptcha = require("./createCaptcha.cjs");
const handleChannelType = require("./handleChannelType.cjs");
const chalk = import('chalk');
/**
 * Captcha Options
 * @typedef {object} CaptchaOptions
 * @property {string} guildID - The guild ID to send the captcha to
 * @property {string} [roleAddID=undefined] - The role ID to add to the user when they complete the captcha
 * @property {string} [roleRemoveID=undefined] - The role ID to remove from the user when they fail to complete the captcha
 * @property {string} [channelID=undefined] - The channel ID to send the captcha to
 * @property {boolean} [sendToTextChannel=false] - Whether to send the captcha to a text channel or a DM
 * @property {boolean} [addRoleOnSuccess=true] - Whether to add the role to the user when they complete the captcha
 * @property {boolean} [removeRoleOnSuccess=false] - Whether to remove the role from the user when they complete the captcha
 * @property {boolean} [kickOnFailure=false] - Whether to kick the user when they fail to complete the captcha
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
     *
     * - `guildID` - The guild ID to send the captcha to
     *
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
     * - `caseSensitive` - Whether the captcha responses are case sensitive
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

        if(!client) {
            console.log(chalk.red(`[Captcha] No client provided`));
            process.exit(1);
        }

       this.client = client;

        /**
         * Captcha Options
         * @type {CaptchaOptions}
         */
        this.options = options;


        if (!options.guildID) {
            console.log(chalk.red(`[Captcha] No guild ID provided`));
            process.exit(1);
        }

        if ((options.sendToTextChannel === true) && (!options.channelID)) {
            console.log(chalk.red(`[Captcha] No channel ID provided`));
            process.exit(1);
        }

        if ((options.addRoleOnSuccess === true) && (!options.roleAddID)) {
            console.log(chalk.red(`[Captcha] No role ID to add provided`));
            process.exit(1);
        }

        if ((options.removeRoleOnSuccess === true) && (!options.roleRemoveID)) {
            console.log(chalk.red(`[Captcha] No role ID to remove provided`));
            process.exit(1);
        }

        if (options.attempts < 1) {
            console.log(chalk.red(`[Captcha] Attempts must be greater than 0`));
            process.exit(1);
        }

        if (options.timeout < 1) {
            console.log(chalk.red(`[Captcha] Invalid timeout provided`));
            process.exit(1);
        }

        if (options.caseSensitive && (typeof options.caseSensitive !== "boolean")) {
            console.log(chalk.red(`[Captcha] 'CaseSensitive' must be a boolean value`));
            process.exit(1);
        }

        if (options.customPromptEmbed && (typeof options.customPromptEmbed === "string")) {
            console.log(chalk.red(`[Captcha] Invalid instance of MessageEmbed provided for 'customPromptEmbed'`));
            process.exit(1);
        }

        if (options.customSuccessEmbed && (typeof options.customSuccessEmbed === "string")) {
            console.log(chalk.red(`[Captcha] Invalid instance of MessageEmbed provided for 'customSuccessEmbed'`));
            process.exit(1);
        }

        if (options.customFailureEmbed && (typeof options.customFailureEmbed === "string")) {
            console.log(chalk.red(`[Captcha] Invalid instance of MessageEmbed provided for 'customFailureEmbed'`));
            process.exit(1);
        }

        if (options.addRoleOnSuccess === undefined) {
            console.log(chalk.yellow(`[Captcha] No 'addRoleOnSuccess' option provided, defaulting to true`));
            options.addRoleOnSuccess = true;
        }

        if (options.removeRoleOnSuccess === undefined) {
            console.log(chalk.yellow(`[Captcha] No 'removeRoleOnSuccess' option provided, defaulting to false`));
            options.removeRoleOnSuccess = false;
        }

        options.attempts = options.attempts || 1;

        if (options.caseSensitive === undefined) {
            console.log(chalk.yellow(`[Captcha] No 'caseSensitive' option provided, defaulting to true`));
            options.caseSensitive = true;
        }

        options.timeout = options.timeout || 60000;

        if (options.showAttemptCount === undefined) {
            console.log(chalk.yellow(`[Captcha] No 'showAttemptCount' option provided, defaulting to true`));
            options.showAttemptCount = true;
        }

        Object.assign(this.options, options);
    }

    /**
     * Presents the CAPTCHA to the user
     *
     * __Note__: The CAPTCHA will be sent in DMs if `sendToTextChannel` is set to `false`, if the user has DMs disabled it will be sent in channelID if provided and deleted after the timeout
     *
     * @param {GuildMember} member - The Discord Server Mmember to present the CAPTCHA to
     * @returns {Promise<boolean>} - Whether the member completed the CAPTCHA or not
     */

    async present(member) {
        if (!member) {
            return console.log(chalk.red(`[Captcha] No member provided`));
        }

        const user = member.user;

        const captcha = await createCaptcha(this.options.caseSensitive).catch(err => {
            console.log(chalk.red(`[Captcha] Error creating captcha: ${err}`));
            return false;
        });

        let attemptsLeft = this.options.attempts || 1;
        let attemptsTaken = 1;

        let captchaResponses = [];


        let captchaIncorrect = new EmbedBuilder()
            .setTitle("❌ You Failed to Complete the CAPTCHA!")
            .setDescription(`${member.user}, you failed to solve the CAPTCHA!\n\nCAPTCHA Text: **${captcha.text}**`)
            .setTimestamp()
            .setColor("#ff0000")
            .setThumbnail(member.guild.iconURL({ dynamic: true }));

        if (this.options.customFailureEmbed) {
            captchaIncorrect = this.options.customFailureEmbed;
        }


        let captchaCorrect = new EmbedBuilder()
            .setTitle("✅ You Completed the CAPTCHA!")
            .setDescription(`${member.user}, you completed the CAPTCHA successfully! You have been given access to **${member.guild.name}**!`)
            .setTimestamp()
            .setColor("#00ff00")
            .setThumbnail(member.guild.iconURL({ dynamic: true }));
        if (this.options.customSuccessEmbed) {
            captchaCorrect = this.options.customSuccessEmbed;
        }

        let captchaPrompt = new EmbedBuilder()
            .setTitle(`🔐 Welcome to ${member.guild.name}! 🔐`)
            .addFields({
                name: "I'm not a robot",
                value: `${member.user}, to gain access to **${member.guild.name}**, you must solve the CAPTCHA below!\n\nThis is done to prevent bots from accessing the server!`
            })
            .setColor("#00e0ff")


        if (this.options.customPromptEmbed) {
            captchaPrompt = this.options.customPromptEmbed
        }

        if (this.options.showAttemptCount) {
            captchaPrompt.setFooter({
                text: this.options.attempts === 1 ? "You have one attempt to solve the CAPTCHA." : `Attempts Left: ${attemptsLeft}`
            })
            captchaPrompt.setImage(`attachment://captcha.png`);
        }

        await handleChannelType(this.client, this.options, user).then(async channel => {
            let captchaEmbed;


            try {
                if ((this.options.channelID) && this.options.sendToTextChannel === true) {
                    channel = (await this.client.channels.fetch(this.options.channelID)).channels.resolve(this.options.channelID)
                } else {
                    channel = await user.createDM()
                }


                captchaEmbed = await channel.send({
                    embeds: [captchaPrompt],
                    files: [{
                        name: "captcha.png", attachment: captcha.image
                    }]
                })
            }
            catch {
                channel = (await this.client.guilds.fetch(this.options.guildID)).channels.resolve(this.options.channelID);
                if (this.options.channelID) {
                    captchaEmbed = await channel.send({
                        embeds: [captchaPrompt],
                        files: [{
                            name: "captcha.png", attachment: captcha.image
                        }]
                    })
                } else {
                    console.log(chalk.red(`[Captcha] Error sending CAPTCHA for ${user.tag}`));
                }
            }

            const captchaFilter = x => {
                return (x.author.id === member.user.id)
            }

            /**
             * It takes a captchaData object, and then it awaits a message from the user, and then it checks if the message
             * is correct, and if it is, it does stuff, and if it isn't, it does other stuff
             * @param captchaData - This is the object that is passed to the captcha function.
             */

            async function handleAttempt(captchaData) {
                await captchaEmbed.channel.awaitMessages({
                    filter: captchaFilter, max: 1, time: captchaData.options.timeout
                }).then(async responses => {

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
                                await member.kick({
                                    reason: `Failed to pass CAPTCHA`
                            });
                            }
                            if ((channel.type === "GUILD_TEXT") && (!member.roles.cache.has(captchaData.options.addRole))) {
                                setTimeout(() => msg.delete({
                                    reason: `Deleting from Captcha timeout`
                                }), 7500);
                                setTimeout(() => member.kick({
                                    reason: "Failed to pass CAPTCHA"
                                }), 7500);
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

                    if (answer === captcha.text) {
                        captchaData.emit("success", {
                            member: member,
                            responses: captchaResponses,
                            attempts: attemptsTaken,
                            captchaText: captcha.text,
                            captchaOptions: captchaData.options
                        })

                        if (captchaData.options.addRoleOnSuccess) {

                            try {
                                await member.roles.add(captchaData.options.roleAddID, 'Passed the CAPTCHA');
                            }
                            catch (err) {
                                console.log(chalk.red(`[Captcha] Error adding role to ${member.user.tag}`));
                            }
                        }
                        if (captchaData.options.removeRoleOnSuccess) { 
                            try {
                                await member.roles.remove(captchaData.options.roleRemoveID, 'Passed the CAPTCHA');
                            }
                            catch (err) {
                                console.log(captchaData.options.roleRemoveID)
                                console.log(err)
                                console.log(chalk.red(`[Captcha] Error removing role from ${member.user.tag}`));
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
                        if (attemptsLeft > 1) {
                            attemptsLeft--;
                            attemptsTaken++;
                            if (channel.type === "GUILD_TEXT") {
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

                        setTimeout(() => member.kick({
                            reason: "Failed to pass CAPTCHA"
                        }), 7500);

                        if (channel.type === "GUILD_TEXT") {
                            await captchaEmbed.delete();
                        }

                        await channel.send({
                            embeds: [captchaIncorrect],
                        }).then(async msg => {
                            if (captchaData.options.kickOnFailure) {
                                if (channel.type === "GUILD_TEXT") {
                                    setTimeout(() => msg.delete({
                                        reason: "Deleting from Captcha timeout"
                                    }), 7500);
                                    setTimeout(() => member.kick({
                                        reason: "Failed to pass CAPTCHA"
                                    }), 7500);
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
            handleAttempt(this);
        })
    }
}

module.exports.Captcha = Captcha;