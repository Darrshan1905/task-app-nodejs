const express = require('express');
const router = express.Router();

const {getProjects, createProject, searchProjects,getProject, updateProject, deleteProject} = require('../controllers/projectsController');
const validateToken = require('../middleware/validateTokenHandler');

router.use(validateToken);

router.use("/:project_id/tasks", require('./taskRoutes'));

router.route("/").get(getProjects)
router.post("/new",createProject)
router.get("/search", searchProjects);
router.get("/:id(\\d+)",getProject)
router.delete("/:id(\\d+)", deleteProject)
router.put("/:id(\\d+)/update", updateProject)

module.exports = router