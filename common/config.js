const { env: ENV } = process;

const CONFIG = {
  port: ENV.PORT || 8080,
  timeOutInMS: ENV.TIMEOUTINMS || 10000,
};

module.exports = CONFIG;
