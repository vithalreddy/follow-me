const WebSocket = require('ws');

const { logger, CONFIG } = require('../common');
const { FollowMeClient } = require('./Client');

process
  .on('unhandledRejection', (reason, p) => {
    logger.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    logger.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });

const url = `ws://localhost:${CONFIG.port}`;
const connection = new WebSocket(url);

connection.onopen = async () => {
  logger.info(`Connected to Server :)`);
  const fmc = new FollowMeClient(connection);
  await fmc.start();
};

connection.onerror = error => {
  logger.info(`WebSocket error: ${error.message}`);
};

// connection.onmessage = e => {
//   logger.info(e.data);
// };
