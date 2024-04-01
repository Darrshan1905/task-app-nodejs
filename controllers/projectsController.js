const pool = require('../config/dbConnection');

const getProjects = async (req, res) => {
    try {
        const selectQuery = 'SELECT * FROM projects';
        const results = await new Promise((resolve, reject) => {
            pool.query(selectQuery, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500);
        throw new Error('Failed to fetch from database');
    }
};

const createProject = async (req, res) => {
    console.log("Request body: ", req.body);
    const {projectTitle, startDate, endDate} = req.body;
    if(!projectTitle || !startDate || !endDate) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }

    try {
        const insertQuery = 'INSERT INTO projects (title, start_date, end_date) VALUES (?, ?, ?)';
        const values = [projectTitle, startDate, endDate];
        await new Promise((resolve, reject) => {
            pool.query(insertQuery, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.status(201).json({ message: "Project created" });
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500);
        throw new Error('Failed to create project');
    }
    
}

// const getProject = (req, res) => {
//     res.status(200).json({message: `Get project for ${req.params.id}`});
// }

const getProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const selectQuery = 'SELECT * FROM projects WHERE id = ?';

        const results = await new Promise((resolve, reject) => {
            pool.query(selectQuery, [projectId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if (results.length === 0) {
            res.status(404);
            throw new Error("Project not found");
        }

        console.log(results);

        const project = results[0];

        res.status(200).json(project);
    } catch (err) {
        console.error('Error fetching project:', err);
        res.status(500);
        throw new Error('Failed to fetch from database');
    }
};

const updateProject = (req, res) => {
    res.status(200).json({message: `Update project for ${req.params.id}`});
}

const deleteProject = (req, res) => {
    res.status(200).json({message: `Delete project for ${req.params.id}`});
}

module.exports = {getProjects, createProject, getProject, updateProject, deleteProject}