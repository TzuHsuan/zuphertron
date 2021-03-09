const http = require('http');
const fetch = require('node-fetch');
const crypto = require('crypto');

const webhookPath = process.env.WEBHOOKPATH;
const ID = process.env.BOT_CLIENT_ID;
const secret = process.env.BOT_SECRET;
const webhookSecret = process.env.WEBHOOK_SECRET;

var accessToken = '';

var processedIDs = new Set();

const server = http.createServer((req, res)=>{
	console.log('recieved request');
    var path = req.url
    if (path === '/webhook/twitch'){
	    console.log('/webhook/twitch endpoint')
	    console.log(req.headers);
        let currentID =req.headers['twitch-eventsub-message-id'];
        if(currentID){ 
            if (processedIDs.has(currentID)) {return res.end()} //discard if dupe message

            processedIDs.add(currentID);
            setTimeout((currentID)=>{processedIDs.delete(currentID)},10*60*1000);
            /* record processed IDs and clear after 10 mins */

            let body = [];
            req.on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                body = Buffer.concat(body);
                let signBody = req.headers['twitch-eventsub-message-id'] + req.headers['twitch-eventsub-message-timestamp'] + body;
                let signature = `sha256=${crypto.createHmac('sha256', webhookSecret).update(signBody).digest('hex')}`;
                if (signature === req.headers['twitch-eventsub-message-signature']){
                    console.log('signature correct!')
                } else {
                    console.log('Signature Incorrect!!/n' + 'recieved: ' + req.headers['twitch-eventsub-message-signature'] + '/n' + 'Calculated: ' + signature);
                }
		if (req.headers['content-type'] === 'application/json') body = JSON.parse(body);
                switch(req.headers['twitch-eventsub-message-type']){
                    case 'webhook_callback_verification':
                        console.log(`recieved and sent challenge: ${body.challenge}`);
                        return res.end(body.challenge);
                    case 'notification':
                        console.log('recieved notification!');
                        process.send({type:req.headers['twitch-eventsub-subscription-type'],body:body});
                        return res.end()
                    default:
                        console.log('unknown message type');
                        return res.end()
                }
            })
         }
    }
        res.end();
});

(function getOAuth(){
    fetch( `https://id.twitch.tv/oauth2/token?client_id=${ID}&client_secret=${secret}&grant_type=client_credentials`, {method:'POST'})
    .then(res => res.json())
    .then(body => { 
		accessToken = body.access_token;
		setTimeout(getOAuth, 2147483647);
    })
    .catch(err => {
        console.error(`Error in getOAuth ${err}`);
    })
})();

(function subToWebhook(){
    if(accessToken){
        fetch('https://api.twitch.tv/helix/eventsub/subscriptions',
            {method:'POST',
            headers:{
                'client-ID':ID,
                'Authorization':`Bearer ${accessToken}`,
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                "type": "channel.follow",
                "version": "1",
                "condition": {
                    "broadcaster_user_id": "19353324"
                },
                "transport": {
                    "method": "webhook",
                    "callback": webhookPath,
                    "secret": webhookSecret
                }
            })
        })
        .then(res => {
            console.log(`webhook request ${res.status}`);
		return res.text();
        }).then(text => console.log(text))
    }else{
        console.log('No access token, retrying webhook in 2 seconds');
        setTimeout(subToWebhook, 2000);
    }
})()


server.listen(process.env.PORT||5001,'localhost',(err)=> {
    if (err) {console.err('error listening')}
    console.log('now listening on port 5001');
});
