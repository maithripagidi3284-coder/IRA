const { readTasks, writeTasks } = require('../utils/fileStore');
const { randomUUID } = require('crypto');

// Helper: get today's date as YYYY-MM-DD (no time component)
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// GET /tasks — list everything
function getAllTasks(req, res) {
  const tasks = readTasks();
  res.json(tasks);
}

// POST /tasks — create a new task
// body: { title, category, dueDate }  dueDate format: "YYYY-MM-DD"
function createTask(req, res) {
  const { title, category, dueDate } = req.body;

  if (!title || !dueDate) {
    return res.status(400).json({ error: 'title and dueDate are required' });
  }

  const tasks = readTasks();

  const newTask = {
    id: randomUUID(),
    title,
    category: category || 'general',
    dueDate,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  writeTasks(tasks);

  res.status(201).json(newTask);
}

// PUT /tasks/:id/complete — mark a task as done
function completeTask(req, res) {
  const { id } = req.params;
  const tasks = readTasks();

  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.status = 'done';
  task.completedAt = new Date().toISOString();
  writeTasks(tasks);

  res.json(task);
}

// DELETE /tasks/:id — remove a task
function deleteTask(req, res) {
  const { id } = req.params;
  const tasks = readTasks();

  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) {
    return res.status(404).json({ error: 'Task not found' });
  }

  writeTasks(filtered);
  res.json({ message: 'Task deleted' });
}

// GET /tasks/status — the core "what did I miss" logic
function getStatus(req, res) {
  const tasks = readTasks();
  const today = todayStr();

  const pending = tasks.filter((t) => t.status === 'pending');

  const missed = pending.filter((t) => t.dueDate < today);
  const dueToday = pending.filter((t) => t.dueDate === today);
  const upcoming = pending.filter((t) => t.dueDate > today);
  const completedToday = tasks.filter(
    (t) => t.status === 'done' && t.completedAt && t.completedAt.startsWith(today)
  );

  res.json({
    date: today,
    missedCount: missed.length,
    missed,
    dueToday,
    upcoming,
    completedToday,
  });
}

module.exports = {
  getAllTasks,
  createTask,
  completeTask,
  deleteTask,
  getStatus,
};