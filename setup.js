const readline = require('readline');
const { getConfig, saveConfig } = require('./utils/config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const current = getConfig();
console.log(`Current wake phrase: "${current.wakePhrase}"`);

rl.question('Enter your wake phrase (e.g. "hey agent", "yo assistant"): ', (answer) => {
  const phrase = answer.trim().toLowerCase();

  if (!phrase) {
    console.log('No phrase entered. Keeping the existing one.');
  } else {
    saveConfig({ wakePhrase: phrase });
    console.log(`Wake phrase saved: "${phrase}"`);
    console.log(`From now on, only messages containing "${phrase}" get a response.`);
  }

  rl.close();
});