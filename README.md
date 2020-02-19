# Follow-ME! - web socket based game

It is a simple websocket based game developed using Nodejs, ws module etc

![Gaming walkthrough](https://media.giphy.com/media/UryVDboLrvqEcTFaIV/giphy.gif)
![Gaming walkthrough](https://media.giphy.com/media/mBvHdNR7YZjQws62LX/giphy.gif)
![Gaming walkthrough](https://media.giphy.com/media/KG5xKKxSSafs7RD03K/giphy.gif)

## Setup

- `git clone git@github.com:vithalreddy/follow-me.git`
- `cd follow-me` & `npm i`
- First Start the server using npm cmd:: `npm run start:server`
- Next start the client using npm cmd:: `npm run start:client`
- Once Client is connected to server, server can send a key to client, and client has to reply the same key within fixed time (the time can be passed through env var or can be updated in `common/config.js` file.)
- once client answers 10 question correctly wins the game
- if score reaces -3 then user loses or when user timesout 3 times continuosly.
- please refer above gif for more info
