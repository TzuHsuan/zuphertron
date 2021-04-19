const eventSubBuilder = {
    channel:{
        update: function(channelID) {
            return {
                type: 'channel.update',
                version: '1',
                condition : {
                    broadcaster_user_id: channelID
                }
            }
        }
    },
    transport: (callbackRoute, secret) => {
        return {
            method: 'webhook',
            callback: callbackRoute,
            secret: secret
        }
    }
}

module.exports = {eventSubBuilder};