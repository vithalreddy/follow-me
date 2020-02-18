const { prompt, BooleanPrompt } = require('enquirer');
const ora = require('ora');
const chalk = require('chalk');

const { logger } = require('../common');

class FollowMeClient {
  constructor(wssConn) {
    this.score = 0;
    this.spinner = ora();
    this.wssConn = wssConn;

    this.wssConn.on('message', message => {
      this.handleIncomingData(JSON.parse(message));
    });
  }

  // eslint-disable-next-line
  handleIncomingData(message) {
    // eslint-disable-next-line
    console.log(message, typeof message);
    const { data, type } = message;
    this.spinner.start();
    if (type === 'char') {
      logger.info(
        chalk.blue(
          `Please Enter the "${data}" and press enter in 10 secs`,
        ),
      );
      this.takeUserInput();
    }
    this.spinner.stopAndPersist();
  }

  send(data, type) {
    this.wssConn.send(JSON.stringify({ data, type }));
  }

  validateAndProcessInput(inputStr) {
    if (!inputStr || inputStr.length > 1) {
      this.spinner.fail('Please Enter a valid char.');
      this.start();
    } else {
      this.spinner.succeed(`You have pressed ${inputStr}`);
    }
    this.spinner.stopAndPersist();
    this.send(inputStr, 'charVerify');
  }

  async start() {
    console.log('start');
  }

  async takeUserInput() {
    const { inputStr } = await prompt({
      type: 'input',
      name: 'inputStr',
      message: 'Please enter a single char?',
    });
    this.spinner.start();
    this.validateAndProcessInput(inputStr);
  }

  async restart() {
    const booleanPrompt = new BooleanPrompt({
      header: '========================',
      message: 'Do you want restart game?',
      footer: '========================',
    });

    const result = await booleanPrompt.run();
    if (result) {
      this.send(null, 'restart');
    }
  }
}

// (async () => {
//   const fm = new FollowMeClient();
//   await fm.takeUserInput();
// })();

module.exports = { FollowMeClient };
