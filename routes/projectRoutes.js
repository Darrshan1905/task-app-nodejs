const express = require('express');
const router = express.Router();

const {getProjects, createProject, getProject, updateProject, deleteProject} = require('../controllers/projectsController');
const validateToken = require('../middleware/validateTokenHandler');

router.use(validateToken);

router.use("/:project_id/tasks", require('./taskRoutes'));

router.route("/").get(getProjects)
router.post("/new",createProject)
router.get("/:id",getProject)
router.delete("/:id", deleteProject)
router.put("/:id/update", updateProject)

module.exports = router