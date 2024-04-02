const express = require('express');
const router = express.Router({mergeParams: true});

const {getTasks, createTask, updateTask, deleteTask} = require('../controllers/tasksController');

router.use('/:task_id/comments', require('./commentRoutes'));

router.route("/").get(getTasks);
router.route("/new").post(createTask);
router.route("/:id/update").put(updateTask);
router.route("/:id").delete(deleteTask);

module.exports = router;