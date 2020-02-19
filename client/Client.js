const { prompt, Confirm } = require('enquirer');
const ora = require('ora');
const chalk = require('chalk');

const { CONFIG } = require('../common');

prompt.on('cancel', () => process.exit());

class FollowMeClient {
  constructor(wssConn) {
    this.score = 0;
    this.spinner = ora();
    this.wssConn = wssConn;
    this.spinner.start();

    this.wssConn.on('message', message => {
      // console.log(message);
      this.handleIncomingData(JSON.parse(message));
    });
  }

  handleIncomingData(message) {
    const { data, type } = message;

    if (type === 'char') {
      this.takeUserInput(data);
    } else if (type === 'gameStatus') {
      if (data.status === 'won') {
        console.info(chalk.greenBright(`You have won the game.`));
      } else {
        console.warn(chalk.redBright(`You have lost the game.`));
      }

      this.restart();
    } else if (type === 'timedOut') {
      console.warn(`Timed OUT!!!.`);
    } else if (type === 'score') {
      console.info(
        chalk.cyanBright(`Your Current Score is:: "${data.score}"`),
      );
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
      this.spinner.succeed(`You have Entered ${inputStr}`);
    }
    this.spinner.stopAndPersist();
    this.send(inputStr, 'charVerify');
  }

  // eslint-disable-next-line
  async start() {
    console.info('Starting the Game.... ');
  }

  async takeUserInput(char) {
    const { inputStr } = await prompt({
      type: 'input',
      name: 'inputStr',
      message: `Please Enter the "${char}" and press enter in ${CONFIG.timeOutInMS /
        1000} secs?`,
    });

    this.spinner.start();
    this.validateAndProcessInput(inputStr);
  }

  async restart() {
    const booleanPrompt = new Confirm({
      name: 'question',
      message: 'Do you want restart game?',
    });

    const result = await booleanPrompt.run();
    if (result) {
      this.send(null, 'restart');
    } else {
      process.exit();
    }
  }
}

module.exports = { FollowMeClient };
