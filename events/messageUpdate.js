const { DiscordAPIError } = require("discord.js")

module.exports = {
    run: function (message) {
        if (client.connectedChannels.includes(message.channel.id)) {
            message.author.send({
                embed: new Discord.MessageEmbed()
                    .setAuthor('Edits are not seen by other servers on the UnderNet!')
                    .setDescription('Consider voting on this [issue](https://support.discord.com/hc/en-us/community/posts/360034557771) to tell discord that you want to see this changed!')
                    .setColor(0xD5622C)
            }).catch(() => { }); //catch reject if user doesnt have DMs public
        }
    }
}