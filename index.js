console.clear();
const CP = require('child_process'),
    args = process.argv.splice(2);
(f = () => {
    const child = CP.fork('./main.js', args);
    child.on('exit', (code, sig) => {
        if (code) {
            console.log('RESTARTING!');
            setTimeout(f, 100);
        } else {
            process.exit(0);
        }
    })
})();