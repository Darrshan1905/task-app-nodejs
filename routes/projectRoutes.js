const express = require('express');
const router = express.Router();

const {getProjects, createProject, getProject, updateProject, deleteProject} = require('../controllers/projectsController')

router.use("/:project_id/tasks", require('./taskRoutes'));

router.route("/").get(getProjects)
router.route("/new").post(createProject)
router.route("/:id").get(getProject).delete(deleteProject)
router.route("/:id/update").put(updateProject)

module.exports = router