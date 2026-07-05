const express=require('express');
const router=express.Router();
const{
    getAllTasks,
    createTask,
    completeTask,
    deleteTask,
    getStatus,
} = require('../controllers/taskController');
router.get('/status',getStatus);
router.get('/',getAllTasks);
router.post('/',createTask);
router.put('/:id/complete',completeTask);
router.delete('/:id',deleteTask);
module.exports=router;