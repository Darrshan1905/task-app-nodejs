const express = require('express');
const router = express.Router();

const {getProjects, createProject, getProject, updateProject, deleteProject} = require('../controllers/projectsController');
const validateToken = require('../middleware/validateTokenHandler');

router.use("/:project_id/tasks", require('./taskRoutes'));

router.route("/").get(getProjects)
router.post("/new",validateToken,createProject)
router.get("/:id",getProject)
router.delete("/:id",validateToken, deleteProject)
router.put("/:id/update", validateToken, updateProject)

module.exports = router