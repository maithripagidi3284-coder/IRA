const express = require('express');
const path = require('path');
const taskRoutes = require('./routes/taskRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const { getConfig } = require('./utils/config');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/tasks', taskRoutes);
app.use('/assistant', assistantRoutes);

app.get('/config', (req, res) => {
  res.json(getConfig());
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});