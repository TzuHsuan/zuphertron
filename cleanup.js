require('dotenv').config();
const fetch = require('node-fetch');

const ID = process.env.BOT_CLIENT_ID;
const secret = process.env.BOT_SECRET

var accessToken = '';

(function getOAuth(){
    fetch( `https://id.twitch.tv/oauth2/token?client_id=${ID}&client_secret=${secret}&grant_type=client_credentials`, {method:'POST'})
    .then(res => res.json())
    .then(body => { 
        accessToken = body.access_token;
        getAllSubs();
    })
    .catch(err => {
        console.error(`Error in getOAuth ${err}`);
    })
})()

function getAllSubs(){
    fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
        headers: {
            'client-ID':ID,
            'Authorization':`Bearer ${accessToken}`
        }
    })
    .then(res => res.json())
    .then(data => {
        data.data.forEach(sub => {
            deleteSub(sub.id);
        })
    })
}

function deleteSub(sid){
    fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${sid}`,{
        method:'DELETE',
        headers: {
            'client-ID':ID,
            'Authorization':`Bearer ${accessToken}`
        } 
    })
    .then(res => {
        if(res.ok) {
            console.log(`delete ${sid} ok!`);
        }
    })
}