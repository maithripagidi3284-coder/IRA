const express = require('express');
const router = express.Router();
const { handleAssistant } = require('../controllers/assistantController');

router.post('/', handleAssistant);

module.exports = router;