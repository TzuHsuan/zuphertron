function setCooldown(func, coolDownLength){
    var inCD = false;
    return () => {
        if (!inCD){
            inCD = true;
            func();
            setTimeout(()=>{inCD = false}, coolDownLength);
        } // else ignore 
    }
}

function rateLimitSend(messageFunction, rateAmount, ratePeriod){
	var pastMsg = [], backlog = [];

	function advanceQueue(channel, message){
		pastMsg.push({channel, message});
		setTimeout(()=>{
			pastMsg.shift();
			if(backlog[0]) {
				let msgObj = backlog.shift();
				advanceQueue(msgObj.channel, msgObj.message);
			}
		},ratePeriod);
		messageFunction(channel,message);
	}

	return function(channel, message){
		if(pastMsg.length < rateAmount){
			advanceQueue(channel,message);
		} else {
			backlog.push({channel, message});
      console.warn('Rate limit Reached!')
		}
	}
}

function batchMessage(messageFunction, channels, autoPopTimer) {
	var msgs = {};
	var index = 0;
	
	setInterval(() => {
	  var checked = 0,
		channelCount = channels.length,
		sent = false;
	  while (!sent && (checked < channelCount)) {
		var currentChannel = channels[index];
		var msg = ''
		if (msgs[currentChannel] && msgs[currentChannel].length > 0) {
			while(msgs[currentChannel][0]){
			  if(msg.length + msgs[currentChannel][0].length > 450) {break;}
			  msg += msgs[currentChannel][0] + '; ';
			msgs[currentChannel].shift();
			if(msg.length>250){break;}
		  }
		  messageFunction(currentChannel, msg);
		  
		  sent = true;
		}
		checked += 1
		if (index === channelCount) {
		  index = 0;
		} else {
		  index += 1;
		}
	  }
	}, autoPopTimer)
  
	return function(channel, message) {
	  msgs[channel] = [...msgs[channel] || [], message];
	}
}

module.exports = {
    setCooldown, rateLimitSend, batchMessage
}