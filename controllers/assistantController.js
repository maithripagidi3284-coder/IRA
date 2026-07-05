const { readTasks } = require('../utils/fileStore');

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL_NAME = 'llama3.2:3b';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

async function handleAssistant(req, res) {
  const { transcript } = req.body;
  console.log('Received transcript:', transcript);


  if (!transcript || transcript.trim() === '') {
    return res.status(400).json({ error: 'transcript is required' });
  }

  const tasks = readTasks();
  const today = todayStr();

  const systemPrompt = `You are a voice assistant for a personal task tracker. Today's date is ${today}.
Here is the user's current task list as JSON: ${JSON.stringify(tasks)}

Answer the user's question in ONE short spoken sentence, as if speaking out loud.
Be specific: mention task titles and due dates when relevant.

Treat a task as "completed" if its status is either "done" or "completed" (both mean the same thing).
Treat a task as "pending" only if its status is "pending".

If they ask what they missed, only mention pending tasks with a dueDate before today.
If they ask what's due today, only mention pending tasks with dueDate equal to today.
If they ask what's upcoming, only mention pending tasks with a dueDate after today.
If they ask what they have completed or done, only mention tasks with status "done" or "completed", regardless of due date.
If they ask to list everything, briefly summarize all tasks with their status.
If nothing matches a category, say so clearly and encouragingly.
Do not use markdown, bullet points, or formatting - plain spoken sentences only.`;

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama responded with status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.message?.content?.trim() || 'Sorry, I could not process that.';

    res.json({ reply });
  } catch (err) {
    console.error('Assistant error:', err.message);
    res.status(500).json({
      error: 'Failed to reach the local AI model. Is Ollama running?',
    });
  }
}

module.exports = { handleAssistant };