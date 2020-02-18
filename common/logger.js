const pino = require('pino');

const logger = pino({
  prettyPrint: {
    colorize: true,
    ignore: 'pid,hostname,username',
    translateTime: 'SYS:standard',
  },
});

module.exports = logger;
