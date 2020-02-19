const WebSocket = require('ws');

const { logger, CONFIG } = require('../common');
const { FollowMe } = require('./lib');

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });

const wss = new WebSocket.Server({ port: CONFIG.port });

wss.once('listening', () => {
  logger.info(`wss listening on :: `, wss.address().port);
});

wss.on('connection', async ws => {
  logger.info(`Connection Opened`);
  const fm = new FollowMe(ws);
  fm.takeUserInput();
  wss.on('close', () => {
    if (fm.timer) clearTimeout(fm.timer);
  });
});
