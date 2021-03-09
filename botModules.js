const {evaluate} = require('mathjs');

function say(msgInterface, premission, message = '`${tags.username} 安安！`') {
    return function (channel, tags, ...args) {
        if (premission) {
            var allow = false;
            premission.forEach(req => {
                allow = allow || tags[req];
            })
            if (!allow) return;
        }
        msgInterface(channel, eval(message));
    }
}

function roll(msgInterface, premission, message) {
    var message = message || '`${tags.username}擲出了${amount}個${size}面骰，共骰出了${sum}點！`';
    return function (channel, tags, diceConfig = '3d6') {
        console.log('in roll');
        if (premission) {
            var allow = false;
            premission.forEach(req => {
                allow = allow || tags[req];
            })
            if (!allow) return;
        }
        let [, amount, size] = diceConfig.match(/(\d*)d(\d+)/);
        amount = amount || 1;
        let sum = 0;
        for (let i = 0; i != amount; ++i) {
            sum += Math.floor(Math.random() * size) + 1;
        }
        msgInterface(channel, eval(message));
    }
}

function calc(msgInterface, premission, message = '`${expr} = ${evaluate(expr)}`') {
    return function (channel, tags, expr) {
        if (premission) {
            var allow = false;
            premission.forEach(req => {
                allow = allow || tags[req];
            })
            if (!allow) return;
        }
        msgInterface(channel, eval(message));
    }
}

module.exports = {
    say, roll, calc
}