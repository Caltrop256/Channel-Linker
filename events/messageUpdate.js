const { APIMessage } = require("discord.js");
/**
 * Edits a message that was sent by this webhook.
 * @param {MessageResolvable} message The message to edit
 * @param {StringResolvable|APIMessage} [content] The new content for the message
 * @param {WebhookEditMessageOptions|MessageEmbed|MessageEmbed[]} [options] The options to provide
 * @returns {Promise<Message|Object>} Returns the raw message data if the webhook was instantiated as a
 * {@link WebhookClient} or if the channel is uncached, otherwise a {@link Message} will be returned
 */
async function editMessage(message, content, options) {
    const { data, files } = await (
        (content.resolveData || (()=>undefined))() || APIMessage.create(this, content, options).resolveData()
    ).resolveFiles();
    const d = await this.client.api
        .webhooks(this.id, this.token)
        .messages(typeof message === 'string' ? message : message.id)
        .patch({ data, files });

    const channelManager = this.client.channels;
    if(!channelManager) return d;
    const messageManager = (channelManager.cache.get(d.channel_id) || {}).messages;
    if (!messageManager) return d;

    const existing = messageManager.cache.get(d.id);
    if (!existing) return messageManager.add(d);

    const clone = existing._clone();
    clone._patch(d);
    return clone;
}

module.exports = {
    run: function (message, newmsg) {
        if (client.connectedChannels.includes(message.channel.id) && message.content != newmsg.content) {
            if (message.webhookID && message.webhookID == client.hooks.get(message.channel.id).id) 
                return; //i'm unsure if the webhook can trigger a messageUpdate but just in case
            const msgs = client.messages.get(message.id);
            if (!msgs) return;

            for (let i = 0; i < msgs.length; ++i) {
                if(!msgs[i].webhookID) continue; //ignore message that was edited, which should be the only one without a webhookID
                editMessage.call(this.hooks.get(msgs[i].channel.id),msgs[i],newmsg.content,{
                    embeds: newmsg.embeds.filter(embed => embed.type == 'rich')
                });
            }
        }
    }
}