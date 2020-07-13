module.exports = {
    run: function (oldChannel, newChannel) {
        if (client.connectedChannels.includes(newChannel.id)) {
            const changeNSFW = oldChannel.nsfw != newChannel.nsfw,
                changeSlowMode = oldChannel.rateLimitPerUser != newChannel.rateLimitPerUser;

            for (let i = 0; i < client.connectedChannels.length; ++i) {
                if (client.connectedChannels[i] == newChannel.id) continue;
                const channel = client.channels.resolve(client.connectedChannels[i]);
                if (changeNSFW && channel.nsfw != newChannel.nsfw) {
                    channel.setNSFW(newChannel.nsfw);
                };
                if (changeSlowMode && channel.rateLimitPerUser != newChannel.rateLimitPerUser) {
                    channel.setRateLimitPerUser(newChannel.rateLimitPerUser);
                };
            }
        }
    }
}