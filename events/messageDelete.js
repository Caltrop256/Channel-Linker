module.exports = {
    run: function (message) {
        if (client.connectedChannels.includes(message.channel.id)) {
            let pId;
            if (message.webhookID && message.webhookID == client.hooks.get(message.channel.id).id) {
                pId = client.parentMessageId.get(message.id)
            } else pId = message.id;
            const msgs = client.messages.get(pId);
            if (!msgs) return;

            for (let i = 0; i < msgs.length; ++i) {
                if (client.parentMessageId.has(msgs[i].id)) client.parentMessageId.delete(msgs[i].id);
                if (msgs[i].deleted) continue;
                msgs[i].delete();
            }
            client.messages.delete(pId);
        }
    }
}