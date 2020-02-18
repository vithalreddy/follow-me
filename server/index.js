const WebSocket = require('ws');

const { logger } = require('../common');
const { FollowMe } = require('./lib');

const wss = new WebSocket.Server({ port: 8080 });

wss.once('listening', () => {
  logger.info(`wss listening on :: `, wss.address().port);
});

wss.on('connection', async ws => {
  logger.info(`Connection Opened`);
  const fm = new FollowMe(ws);
  fm.takeUserInput();
});
