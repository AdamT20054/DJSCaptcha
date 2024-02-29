/**
 * @param {Discord.Client} client
 * @param {any} options
 * @param {Discord.User} user
 * @param {Discord.member} member
 * @returns {Discord.DMChannel | Discord.TextChannel}
 */
module.exports = async function handleChannelType(client, options, user, member) {
    let channel;

    if (!options.channelID) { // If no channel ID is provided, create a new DM channel
        // noinspection JSUnresolvedFunction
        channel = await user.createDM();
    } else {
        if (options.sendToTextChannel === true) {
            // If the channel ID is provided, and the sendToTextChannel option is true, set channel as the text channel
            // noinspection JSUnresolvedVariable
            channel = (await client.guilds.fetch(member.guild.id)).channels.resolve(options.channelID);
        }
    }
    return channel
}