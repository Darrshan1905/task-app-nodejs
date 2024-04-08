const express = require('express');
const router = express.Router({mergeParams: true});

const {getTasks, createTask, updateTask, deleteTask} = require('../controllers/tasksController');
const validateToken = require('../middleware/validateTokenHandler');

router.use('/:task_id/comments', require('./commentRoutes'));

router.get("/", getTasks);
router.post("/new", validateToken, createTask);
router.put("/:id/update", validateToken, updateTask);
router.delete("/:id",validateToken, deleteTask);

module.exports = router;