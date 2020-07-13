module.exports = {
    run: async function (message) {
        if (client.connectedChannels.includes(message.channel.id)) {
            if (message.webhookID && message.webhookID == client.hooks.get(message.channel.id).id) return;
            const hookMessages = [message];

            for (let i = 0; i < client.connectedChannels.length; ++i) {
                const channelId = client.connectedChannels[i];
                if (channelId == message.channel.id) continue;

                const msg = (await client.sendHookMessage(channelId, message.author.id, message))[0];
                hookMessages.push(msg);
                client.parentMessageId.set(msg.id, message.id);
            }

            client.messages.set(message.id, hookMessages);
            if (client.messages.size > client.maxCacheSize) {
                const key = Array.from(client.messages)[0][0],
                    parentLinkArr = Array.from(client.parentMessageId);
                client.messages.delete(key);

                for (let i = 0; i < parentLinkArr.length; ++i) {
                    if (key == parentLinkArr[i][1]) {
                        client.parentMessageId.delete(parentLinkArr[i][0]);
                    }
                }
            }
        }
    }
}