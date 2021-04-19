const {eventSubBuilder} = require('./eventSubBuilder');

var webhook = Object.assign(eventSubBuilder.channel.update(123), {transport:eventSubBuilder.transport(123, 123)});
//webhook = {...webhook, transport: eventSubBuilder.transport(123, 123)};

console.log(
   webhook 
);