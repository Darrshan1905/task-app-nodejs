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

        if(results.length === 0) {
            res.status(200).json({message: "No projects yet!"});
            return;
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({error: "Failed to fetch from database"});
        return;
        // throw new Error('Failed to fetch from database');
    }
};

const createProject = async (req, res) => {
    console.log("Request body: ", req.body);
    const {title, start_date, end_date} = req.body;

    if(!title || !start_date || !end_date) {
        res.status(400).json({error: "All fields are mandatory"});
        //throw new Error("All fields are mandatory");
        return;
    }

    try {
        const insertQuery = 'INSERT INTO projects (title, start_date, end_date) VALUES (?, ?, ?)';
        const values = [title, start_date, end_date];
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
        res.status(500).json({error: "Failed to create project in database"});
        return;
        //throw new Error('Failed to create project in database');
    }    
}

const getProject = async (req, res) => {
    console.log(req)
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
            console.error(`Project with id ${projectId} not found`);
            res.status(404).json({error: `Project with id ${projectId} not found`});
            return;
            // throw new Error(`Project with id ${projectId} not found`);
        }

        console.log(results);

        const project = results[0];

        res.status(200).json(project);
    } catch (err) {
        console.error('Error fetching project:', err);
        res.status(500).json({error: "Failed to fetch from database"});
        return;
        // throw new Error('Failed to fetch from database');
    }
};

const updateProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const {title, start_date, end_date} = req.body;

        if(!title || !start_date || !end_date) {
            res.status(400).json({error: "All fields are mandatory"});
            //throw new Error("All fields are mandatory");
            return;
        }
        
        const updateQuery = `UPDATE projects SET title = ?, start_date = ?, end_date = ? WHERE id = ?`;
        const values = [title, start_date, end_date, projectId];

        const results = await new Promise((resolve, reject) => {
            pool.query(updateQuery, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if(results.affectedRows === 0) {
            console.error(`Project with id ${projectId} not found`);
            res.status(404).json({error: `Project with id ${projectId} not found`});
            return;
            // throw new Error(`Project with id ${projectId} not found`);
        }

        res.status(200).json({message: `Updated project for id ${req.params.id}`});
    } catch(err) {
        console.error('Error updating project:', err);
        res.status(500).json({error: "Failed to update database"});
        return;
        // throw new Error('Failed to update database');
    }   
}

const deleteProject = async (req, res) => {
    const projectId = req.params.id;
    try {
        const q = 'SELECT id from tasks where project_id = ?';

        const r = await new Promise((resolve, reject) => {
            pool.query(q, [projectId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        for(let i = 0; i < r.length; i++) {
            const q1 = 'DELETE from comments where task_id = ?';

            const r1 = await new Promise((resolve, reject) => {
                pool.query(q1, [r[i].id], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        }

        const q2 = 'DELETE from tasks where project_id = ?';

        const r2 = await new Promise((resolve, reject) => {
            pool.query(q2, [projectId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        const query = `DELETE FROM projects WHERE id = ?`;

        const results = await new Promise((resolve, reject) => {
            pool.query(query, [projectId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if(results.affectedRows === 0) {
            console.error(`Project with id ${projectId} not found`);
            res.status(404).json({error: `Project with id ${projectId} not found`});
            return;
            // throw new Error(`Project with id ${projectId} not found`);
        }        

        res.status(200).json({message: `Deleted project for ${req.params.id}`});
    } catch(err) {
        console.error('Error deleting project:', err);
        res.status(500).json({error: "Failed to delete project from database"});
        return;
    }
}

module.exports = {getProjects, createProject, getProject, updateProject, deleteProject}