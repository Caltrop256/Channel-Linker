const fs = require('fs');
const { Channel } = require('discord.js');

class ChannelLinker extends global.Discord.Client {
    constructor() {
        super({
            retryLimit: 30,
            disableMentions: 'everyone'
        });
        this.config = require('./config.json');

        this.connectedChannels = this.config.channels;
        this.maxCacheSize = ~~this.config.cacheSizeLimit;
        this.hooks = new Map();
        this.messages = new Map();
        this.parentMessageId = new Map();

        super.login(this.config.token);
        this.once('ready', async () => {
            let isNSFW = false,
                rateLimit = 0;
            for (let i = 0; i < this.connectedChannels.length; ++i) {
                const channel = this.channels.resolve(this.connectedChannels[i]),
                    hooks = await channel.fetchWebhooks(),
                    hA = Array.from(hooks);

                if (channel.nsfw) isNSFW = true;
                if (channel.rateLimitPerUser > rateLimit) rateLimit = channel.rateLimitPerUser;
                for (let j = 0; j < hA.length; ++j) {
                    if (hA[j][1].owner.id == this.user.id) {
                        this.hooks.set(this.connectedChannels[i], hA[j][1]);
                        break;
                    }
                }

                if (!this.hooks.has(this.connectedChannels[i])) {
                    const hook = await channel.createWebhook('CollabChannelhook', {
                        avatar: this.user.avatarURL
                    });
                    this.hooks.set(this.connectedChannels[i], hook);
                }
            };

            for (let i = 0; i < this.connectedChannels.length; ++i) {
                const channel = this.channels.resolve(this.connectedChannels[i]);
                channel.setNSFW(isNSFW);
                channel.setRateLimitPerUser(rateLimit);
            }
            fs.readdir('./events/', (err, events) => {
                if (err) throw err;
                for (let i = 0; i < events.length; ++i) {
                    const ev = require('./events/' + events[i]);
                    this.on(events[i].split('.js')[0], ev.run);
                }
                console.log("online!");
            });
        });
    }

    getMemberInfo = (userId, guildId) => {
        return new Promise((resolve) => {
            this.users.fetch(userId).then(user => {
                const data = {
                    avatar: user.displayAvatarURL({
                        format: 'png',
                        dynamic: true,
                        size: 512
                    }),
                    name: user.username,
                    isNitro:user.avatar && user.avatar.startsWith('a_')
                };

                if (guildId) {
                    const member = this.guilds.cache.get(guildId).member(user);
                    if (member && member.nickname) data.name = member.nickname;
                }
                resolve(data)
            });
        });
    };

    sendHookMessage = (channelId, userId, msg,once) => {
        return new Promise(async (resolve, reject) => {
            const hook = this.hooks.get(channelId),
                channel = this.channels.resolve(channelId),
                user = await this.getMemberInfo(userId, channel.guild.id),
                data = {
                    username: user.name,
                    avatarURL: user.avatar,
                    embeds: msg.embeds.filter(embed => embed.type == 'rich'),
                    tts: false
                };
            let blockedAttachments = [] 
            if (msg.attachments.size) {
                data.files = [];
                const fileArr = Array.from(msg.attachments).map(a => a[1]);
                let totalSize = 0;
                for(let i = 0; i < fileArr.length;++i)
                {
                    const file = fileArr[i];
                    if((totalSize + file.size) > 8_000_000)
                    {
                        blockedAttachments.push(file);
                        continue;
                    }
                    data.files.push(file.url);
                    totalSize += file.size;
                }
            }
            if(blockedAttachments.length && once) //once used to only show the message once
                msg.author.send({
                    embed: new Discord.MessageEmbed()
                        .setAuthor('Some files not successfully sent!')
                        .setDescription(`The following files were unable to be sent: ${blockedAttachments.map(blockedAttachment => blockedAttachment.url).join(' , ')} . `+
                        (data.files.length ? "Please try uploading these files in a seperate message for others to see them." : 
                        (user.isNitro ? "The bot cannot upload an 8MB+ file like a nitro user" :
                        "Due to it being next to impossible to determine if a file sent by a user can be sent to all connected channels by the bot, the limit we use has been reduced a little bit below the actual limit provided by discord. We're very sorry for the inconvenience.")))
                        .setColor(0xD5622C)
                }).catch(() => { }); //catch reject if user doesnt have DMs public

            // note that the '** **' produces a space since
            // the discord.js library makes the promise resolve to undefined
            // if no characters are sent
            hook.send(msg.content || '** **', data)
                .then(resolve)
                .catch(reject);
        });
    };


};

module.exports = ChannelLinker;