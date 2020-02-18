const { prompt } = require('enquirer');
const ora = require('ora');
const chalk = require('chalk');

const { logger } = require('../../common');

class FollowMe {
  constructor(wssConn) {
    this.score = 0;
    this.spinner = ora();
    this.wssConn = wssConn;
    this.timer = null;
    this.currentChar = null;

    this.wssConn.on('message', message => {
      this.handleIncomingData(JSON.parse(message));
    });
    this.restart();
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
    }
    this.spinner.stopAndPersist();
  }

  handleGameOver() {
    if (this.timer) clearTimeout(this.timer);
    if (this.score === 10) {
      this.send({
        type: 'gameStatus',
        data: { score: this.score, status: 'won' },
      });
    } else if (this.score === -3) {
      this.send({
        type: 'gameStatus',
        data: { score: this.score, status: 'lost' },
      });
    } else {
      this.send({
        type: 'score',
        data: { score: this.score },
      });
      this.takeUserInput();
    }
  }

  handleTimeout() {
    this.score -= 1;
    console.log('Timed out!!!');
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
    this.timer = setTimeout(this.handleTimeout, 10000);
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
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}

// (async () => {
//   const fm = new FollowMe();
//   await fm.takeUserInput();
// })();

module.exports = { FollowMe };
