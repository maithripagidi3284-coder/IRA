const fs = require('fs');
const path = require('path');

const CONFIG_PATH = process.env.USER_DATA_DIR
  ? path.join(process.env.USER_DATA_DIR, 'config.json')
  : path.join(__dirname, '..', 'config.json');

function getConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { wakePhrase: 'hey ai' };
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw || '{}');
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

module.exports = { getConfig, saveConfig };