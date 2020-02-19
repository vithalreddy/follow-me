const { prompt } = require('enquirer');
const ora = require('ora');

const { logger, CONFIG } = require('../../common');

prompt.on('cancel', () => process.exit());

class FollowMe {
  constructor(wssConn) {
    this.score = 0;
    this.spinner = ora();
    this.wssConn = wssConn;
    this.timer = null;
    this.currentChar = null;
    this.noOfTimeouts = 0;

    this.wssConn.on('message', message => {
      this.handleIncomingData(JSON.parse(message));
    });
  }

  handleAnswer(data) {
    if (this.currentChar === data) {
      this.score += 1;
    } else {
      this.score -= 1;
    }
    this.handleGameOver();
  }

  handleIncomingData(message) {
    const { data, type } = message;
    this.spinner.start();
    if (type === 'charVerify') {
      this.handleAnswer(data);
    } else if (type === 'restart') {
      this.restart();
    }
    this.spinner.stopAndPersist();
  }

  handleGameOver() {
    if (this.timer) clearTimeout(this.timer);
    if (this.score === 5) {
      this.send({ score: this.score, status: 'won' }, 'gameStatus');
    } else if (this.score === -3 || this.noOfTimeouts === 3) {
      this.send({ score: this.score, status: 'lost' }, 'gameStatus');
    } else {
      this.send({ score: this.score }, 'score');
      this.takeUserInput();
    }
  }

  handleTimeout() {
    this.score -= 1;
    this.noOfTimeouts -= 1;
    logger.warn('Timed out!!!');
    this.send({}, 'timedOut');
    this.handleGameOver();
  }

  send(data, type) {
    this.wssConn.send(JSON.stringify({ data, type }));
  }

  validateAndProcessInput(inputStr) {
    if (!inputStr || inputStr.length > 1) {
      this.spinner.fail('Please Enter a valid char.');
      this.takeUserInput();
    } else {
      this.spinner.succeed(`You have pressed ${inputStr}`);
    }
    this.spinner.stopAndPersist();
    this.send(inputStr, 'char');
    this.currentChar = inputStr;

    if (this.timer) clearTimeout(this.timer);

    this.handleTimeout = this.handleTimeout.bind(this);

    this.timer = setTimeout(this.handleTimeout, CONFIG.timeOutInMS);
  }

  async takeUserInput() {
    const { inputStr } = await prompt({
      type: 'input',
      name: 'inputStr',
      message: `Please enter a single char?`,
    });
    this.spinner.start();
    this.validateAndProcessInput(inputStr);
  }

  async restart() {
    this.score = 0;
    this.noOfTimeouts = 0;
    this.currentChar = null;

    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.takeUserInput();
  }
}

module.exports = { FollowMe };
