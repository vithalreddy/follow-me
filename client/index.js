const WebSocket = require('ws');

const { logger } = require('../common');
const { FollowMeClient } = require('./Client');

const url = 'ws://localhost:8080';
const connection = new WebSocket(url);

connection.onopen = async () => {
  logger.info(`Connected to Server :)`);
  const fmc = new FollowMeClient(connection);
  await fmc.start();
};

connection.onerror = error => {
  logger.info(`WebSocket error: ${error.message}`);
};

connection.onmessage = e => {
  logger.info(e.data);
};
