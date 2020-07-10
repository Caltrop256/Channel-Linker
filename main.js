global.Discord = require('discord.js');
const UnderNet = require('./UnderNet.js');
global.client = new UnderNet();

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