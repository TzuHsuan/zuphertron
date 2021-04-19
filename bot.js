const tmi = require('tmi.js');
var cmdConfig = require('./commands.json');
const botModules = require('./botModules');
const {rateLimitSend, batchMessage } = require('./utils.js');
const {fork} = require('child_process');
require('dotenv').config();

const webHandler = fork('webhook.js');
webHandler.on('message', (msg) => {
	console.log(`message recieved: ${msg}`);
	rateLimitSay('#zuphest', `just had a new ${msg.type}?`);
})


var channels = process.env.CHANNELS || [ /*'zuphertron' /*, 'hiyumii',*/ 'zuphest' ];

const RATE_AMOUNT = 3;
const RATE_PERIOD = 10 * 1000;
const AUTO_POP_TIMER = 2000;

const client = new tmi.Client({
	options: { debug: true },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: process.env.TWITCH_USERNAME,
		password: process.env.TWITCH_OAUTH
	},
	channels: channels
});
client.connect().catch(console.error);


const rateLimitSay = rateLimitSend(client.say.bind(client), RATE_AMOUNT, RATE_PERIOD);
const batchSend = batchMessage(rateLimitSay, channels, AUTO_POP_TIMER);
const msgTypes = {
	direct: rateLimitSay,
	queue: batchSend
}
var commands = {};
Object.keys(cmdConfig).forEach((key)=> {
	var channelConfig = cmdConfig[key];
	commands[key] = {};
	var parent = commands[key];
	addChannelCommands(parent, channelConfig)
	//console.log(commands);
})

function addChannelCommands(channel, config){
	console.log(channel);
	Object.keys(config).forEach((key)=>{
		//each command
		var cur = config[key];
		if(cur.enabled){
		channel[key] = botModules[cur.module](msgTypes[cur.send], cur.premission,  ...cur.params);
		if(cur.alias){
			cur.alias.forEach(keyName => {
				channel[keyName] = channel[key];
			})
		}
		}
	})
}

console.log(commands);



client.on('message', (channel, tags, message, self) => {
	if(self) return;

	let [command, ...args] = message.match(/[\S]+(?=\(([^\(\)]*)\))/) || []; //default empty array to avoid non-iterable error
	if(command){
		console.log(channel);
		if(typeof commands[channel][command] === 'function') commands[channel][command](channel, tags, ...args);
		/*
		switch(command.toLowerCase()){
			case 'hello':
				hello(channel, tags, ...args);
				break;
			case '骰':
			case 'roll':
			console.log(args);
				roll(channel, tags, ...args);
				break;
			case 'calc':
			console.log(args);
				calc(channel, tags, ...args);
				break;
			default:
			    break;
		}*/
	}
});

/*
client.on('join', (channel, username) => {
	rateLimitSay(channel, `${username} has joined`);
})
*/