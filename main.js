global.Discord = require('discord.js');
const ChannelLinker = require('./ChannelLinker.js');
global.client = new ChannelLinker();

let input = '',
    stdin = process.openStdin();
stdin.addListener('data', s => {
    input += s
    if (s.toString().endsWith('\n')) {
        let evaled = '';
        try {
            evaled = eval(input);
        } catch (e) {
            evaled = e;
        }
        console.log(evaled);
        input = '';
    }
});