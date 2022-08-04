/**
 * 
 * @param {Discord.Client} client
 * @param {any} options
 * @param {Discord.User} user
 * @returns {Discord.DMChannel | Discord.TextChannel}
 */
module.exports = async function handleChannelType(client, options, user) {
    let channel;

    if (!options.channelID) { // If no channel ID is provided, create a new DM channel
        channel = await user.createDM();
    } else {
        if (options.sendToTextChannel === true) {
            // If the channel ID is provided, and the sendToTextChannel option is true, set channel as the text channel
            channel = (await client.guilds.fetch(options.guildID)).channels.resolve(options.channelID);
        }
    }
    return channel
}