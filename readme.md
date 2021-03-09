# Zuphertron - Twitch Chat Bot (WIP)

This project doesn't differ much from existing solutions such as StreamElements(https://streamelements.com/) or NightBot(https://nightbot.tv/). 

It's more of a learning project at this point. But hopefully we'll end up with something not that less than the two solutions mentioned about whilst being more flexible. 

## Working Features

### Keyword commands

Funtional at this point, but still have issues to consider. 

Currently uses a funtion format ie:`name(params)`
I am a little unsure how well that works with general users.
(But hey, I'm the only user now)

The previous point is achieved by regex matching, which I am terribly bad at, so there may be some room for efficency improvments.

And for flexible responses it currently uses `eval()` on a template string.
That makes things a lot easier, but probably is a security risk.
Current solution in mind is to create our own parsing function and only substitue varibles that we allow.

### Twitch EventSub

The Skeleton is completed but still need abstract it out so it can be reused for each user.

It currently subs to the following event for my channel on load, and sends a message in chat when recieving a notification.

todo:
1. setup template for each event type
2. load which events to sub to for each channel and how to react to them
3. some sort of management process to avoid duplicate subs to the same event

and by extention to point 2, maybe some sort of alertbox system like what the current solutions have.
Should just be a client that holds a websocket connection and plays an animation.

## Planned features

- A user control panel to edit how the bot behaves in their channel