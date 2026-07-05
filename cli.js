const readline = require('readline');
const { getConfig } = require('./utils/config');

const BASE_URL = 'http://localhost:3000';
const { wakePhrase } = getConfig();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'You: ',
});

console.log(`Task Agent CLI - say "${wakePhrase}" followed by your question.`);
console.log(`Example: "${wakePhrase} what did I miss"`);
console.log('Type "exit" anytime to quit.\n');
rl.prompt();

rl.on('line', async (line) => {
  const text = line.trim().toLowerCase();

  if (text === 'exit' || text === 'quit') {
    console.log('Agent: See you tomorrow. Keep the streak alive.');
    rl.close();
    return;
  }

  if (!text.includes(wakePhrase)) {
    rl.prompt();
    return;
  }

  const command = text.replace(wakePhrase, '').trim();

  try {
    if (command === '') {
      console.log('Agent: Yes? Try asking what you missed or what is due today.');
    } else if (command.includes('missed') || command.includes('left')) {
      await handleStatus('missed');
    } else if (command.includes('today')) {
      await handleStatus('today');
    } else if (command.includes('upcoming')) {
      await handleStatus('upcoming');
    } else if (command.includes('list') || command.includes('all')) {
      await handleList();
    } else {
      console.log('Agent: I did not understand that. Try "what did I miss" or "list all".');
    }
  } catch (err) {
    console.log('Agent: Something went wrong talking to the server ->', err.message);
  }

  console.log('');
  rl.prompt();
});

async function handleStatus(type) {
  const res = await fetch(`${BASE_URL}/tasks/status`);
  const data = await res.json();

  if (type === 'missed') {
    if (data.missed.length === 0) {
      console.log('Agent: Nothing missed. You are fully caught up.');
    } else {
      const titles = data.missed.map((t) => t.title).join(', ');
      console.log(`Agent: You have ${data.missed.length} missed task(s): ${titles}.`);
    }
  }

  if (type === 'today') {
    if (data.dueToday.length === 0) {
      console.log('Agent: Nothing due today.');
    } else {
      const titles = data.dueToday.map((t) => t.title).join(', ');
      console.log(`Agent: Due today: ${titles}.`);
    }
  }

  if (type === 'upcoming') {
    if (data.upcoming.length === 0) {
      console.log('Agent: No upcoming tasks scheduled.');
    } else {
      const titles = data.upcoming.map((t) => t.title).join(', ');
      console.log(`Agent: Coming up: ${titles}.`);
    }
  }
}

async function handleList() {
  const res = await fetch(`${BASE_URL}/tasks`);
  const tasks = await res.json();

  if (tasks.length === 0) {
    console.log('Agent: No tasks saved yet.');
    return;
  }

  console.log('Agent: Here is everything:');
  tasks.forEach((t) => {
    const marker = t.status === 'done' ? '[done]' : '[pending]';
    console.log(`  ${marker} ${t.title} (due ${t.dueDate})`);
  });
}