const express = require('express');
const router = express.Router({mergeParams: true});

const {getTasks, searchTasks, createTask, updateTask, deleteTask} = require('../controllers/tasksController');
const validateToken = require('../middleware/validateTokenHandler');

router.use(validateToken);

router.use('/:task_id/comments', require('./commentRoutes'));

router.get("/", getTasks);
router.get("/search", searchTasks);
router.post("/new", createTask);
router.put("/:id(\\d+)/update", updateTask);
router.delete("/:id(\\d+)", deleteTask);

module.exports = router;