# Task Agent — Offline AI Voice Assistant

A voice-activated AI agent that lives on your desktop as a small floating orb — not a browser tab, not another window competing for space. Say a custom wake phrase, ask what you've missed or what's due today, and it answers out loud, reasoning over your real task list with a locally-running LLM.

Everything runs offline. Speech recognition, task logic, and AI reasoning all happen on your machine — nothing is sent to the cloud.

![Task Agent Orb Demo](docs/demo.gif)
<!-- Replace docs/demo.gif with your actual screen recording -->

## Why I built this

As a student juggling DSA practice, project work, and interview prep, I kept losing track of what I'd actually finished each day. I wanted something that would just tell me — out loud, without opening another app — what was missed, due, or done.

## Features

- 🔵 **Floating orb UI** — a frameless, transparent, always-on-top widget, not a typical app window
- 🎙️ **Custom wake phrase** — set your own trigger phrase, no hardcoded "hey Siri" style default
- 🗣️ **Natural voice commands** — ask what you've missed, what's due today, what's upcoming, or what you've completed
- 🧠 **Local LLM reasoning** — powered by Ollama (Llama 3.2), understands varied phrasing, not just rigid keywords
- 🔒 **Fully offline** — no API keys, no cloud costs, no data leaves your machine
- 💾 **Persistent task tracking** — a lightweight REST API backs the whole system

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express.js |
| Desktop shell | Electron (frameless, transparent, always-on-top) |
| Speech-to-text | Python + Vosk (offline) |
| LLM reasoning | Ollama running Llama 3.2 |
| Voice output | Web Speech Synthesis API |
| Storage | JSON file-based persistence |
| Packaging | electron-builder (Windows installer) |

## Architecture

```
Wake phrase detected (Vosk, Python)
        │
        ▼
Command transcribed (Vosk, open vocabulary)
        │
        ▼
Sent to Express API (/assistant)
        │
        ▼
Task data + transcript → Ollama (local LLM)
        │
        ▼
Natural language reply → spoken aloud (Web Speech Synthesis)
```

## Installation

### Option A — Download the installer (easiest)

1. Go to the [Releases page](../../releases)
2. Download the latest `task-agent-backend Setup x.x.x.exe`
3. Run the installer
4. **Prerequisite:** install [Ollama](https://ollama.com/download) separately and pull a model:
   ```
   ollama pull llama3.2:3b
   ```
5. Launch "Task Agent" from your Start menu

### Option B — Run from source

**Prerequisites:**
- [Node.js](https://nodejs.org) (v18+)
- [Python](https://python.org) (3.9+)
- [Ollama](https://ollama.com/download)

```bash
git clone https://github.com/yourusername/task-agent-backend.git
cd task-agent-backend
npm install
pip install vosk
ollama pull llama3.2:3b
```

Download a Vosk speech model from [alphacephei.com/vosk/models](https://alphacephei.com/vosk/models) (e.g. `vosk-model-small-en-us-0.15`) and place it in a `model/` folder in the project root.

Run the app:
```bash
npm run dev        # starts the Express backend
npm run electron   # in a separate terminal, launches the orb
```

## Usage

1. Click the orb once to start listening
2. Say your wake phrase followed by a question, e.g. *"hey ai what have I missed"*
3. The orb glows while listening and speaking, and responds out loud

Set your own wake phrase:
```bash
npm run setup
```

## Adding tasks

Tasks are managed via the REST API:
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Solve 3 DSA problems","category":"dsa","dueDate":"2026-07-10"}'
```

## Roadmap

- [ ] In-app task creation (no API calls needed)
- [ ] Analytics dashboard (completion streaks, category breakdown)
- [ ] Google Calendar sync
- [ ] macOS / Linux support

## Known limitations

- Currently Windows-only (packaging for other platforms not yet done)
- Offline speech recognition accuracy depends on microphone quality and the Vosk model size chosen
- Requires Ollama installed separately (not bundled in the installer)

## License

MIT

## Author

Built by [Your Name] — a 2nd year CS student.
Feel free to reach out or open an issue with feedback!

4. Download a Vosk model from [alphacephei.com/vosk/models](https://alphacephei.com/vosk/models) 
   (e.g. `vosk-model-small-en-us-0.15`) and place it in:
   `%LOCALAPPDATA%\Programs\task-agent-backend\resources\model\`