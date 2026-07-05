const { app, BrowserWindow, Menu, session, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const readline = require('readline');
const { getConfig } = require('../utils/config');
const { fork } = require('child_process');

const ORB_SIZE = 220;
const POSITION_FILE = path.join(app.getPath('userData'), 'orb-position.json');
const MODEL_PATH = resolvePath('..', 'model', 'vosk-model-small-en-us-0.15');
const PYTHON_SCRIPT = resolvePath('..', 'python', 'stt_worker.py');

let mainWindow;
let pythonProcess;
let serverProcess;
function loadSavedPosition() {
  try {
    const raw = fs.readFileSync(POSITION_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function savePosition(x, y) {
  fs.writeFileSync(POSITION_FILE, JSON.stringify({ x, y }));
}

function createWindow() {
  const saved = loadSavedPosition();

  mainWindow = new BrowserWindow({
    width: ORB_SIZE,
    height: ORB_SIZE + 40,
    x: saved ? saved.x : undefined,
    y: saved ? saved.y : undefined,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

mainWindow.loadURL('http://localhost:3000');
  mainWindow.on('moved', () => {
    const [x, y] = mainWindow.getPosition();
    savePosition(x, y);
  });

  mainWindow.webContents.on('context-menu', () => {
    Menu.buildFromTemplate([
      { label: 'Quit Task Agent', click: () => app.quit() },
    ]).popup();
  });
}
function resolvePath(...parts) {
  const p = path.join(__dirname, ...parts);
  return app.isPackaged ? p.replace('app.asar', 'app.asar.unpacked') : p;
}
function buildGrammar() {
  const { wakePhrase } = getConfig();

  const commands = [
    'what have i missed',
    'what tasks have i missed',
    'what did i miss',
    'what is due today',
    'what tasks are due today',
    'what is upcoming',
    'what tasks are upcoming',
    'list all',
    'list all tasks',
  ];

  const phrases = commands.map((cmd) => `${wakePhrase} ${cmd}`);
  phrases.push(wakePhrase);
  phrases.push('[unk]'); // catch-all bucket for anything outside this list

  return JSON.stringify(phrases);
}

function startPythonSTT() {
  const { wakePhrase } = getConfig();
  pythonProcess = spawn('python', ['-u', PYTHON_SCRIPT, MODEL_PATH, wakePhrase]);
   pythonProcess.on('error', (err) => {
    console.error('FAILED TO START PYTHON:', err.message);
  });

  const rl = readline.createInterface({ input: pythonProcess.stdout });
  rl.on('line', (line) => {
    try {
      const msg = JSON.parse(line);
      if (msg.type === 'final' && mainWindow) {
        mainWindow.webContents.send('speech-result', msg.text);
      }
      if (msg.type === 'partial') {
        console.log('partial:', msg.text);
      }
      if (msg.type === 'wake_detected') {
        console.log('Wake phrase detected, listening for command...');
      }
    } catch {
      // ignore stray non-JSON output
    }
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error('Python STT error:', data.toString());
  });

  pythonProcess.on('exit', (code) => {
    console.log('Python STT process exited with code', code);
  });
}

// Renderer streams raw audio chunks here, forwarded straight to Python's stdin
let chunkCount = 0;
ipcMain.on('audio-chunk', (event, buffer) => {
  chunkCount++;
  if (chunkCount === 1) {
    console.log('First audio chunk received, size:', buffer.byteLength);
  }
  if (pythonProcess && pythonProcess.stdin.writable) {
    pythonProcess.stdin.write(Buffer.from(buffer));
  }
});


function startServer() {
  const serverPath = path.join(__dirname, '..', 'server.js');
  serverProcess = fork(serverPath, [], {
    silent: false,
    env: { ...process.env, USER_DATA_DIR: app.getPath('userData') },
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err.message);
  });

  serverProcess.on('exit', (code) => {
    console.log('Server process exited with code', code);
  });
}
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(permission === 'media');
  });

  startServer();
  startPythonSTT();

  // give the server a moment to actually start listening before loading the page
  setTimeout(createWindow, 1500);
});

app.on('window-all-closed', () => {
  if (pythonProcess) pythonProcess.kill();
  if (serverProcess) serverProcess.kill();
  app.quit();
});