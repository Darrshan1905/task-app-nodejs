const moment = require('moment');

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

        console.log(results)

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({error: "Failed to fetch from database"});
        return;
    }
};

const createProject = async (req, res) => {
    console.log("Request body: ", req.body);
    const {title, start_date, end_date} = req.body;
    const userId = req.user.id;

    if(!title || !start_date || !end_date) {
        res.status(400).json({error: "All fields are mandatory"});
        return;
    }

    if(start_date > end_date) {
        res.status(400).json({error: "Start Date must be before end date"});
        return;
    }

    try {
        console.log(start_date, end_date);
        console.log(typeof(start_date))
        const startDate = moment(start_date).format('YYYY-MM-DD');
        const endDate = moment(end_date).format('YYYY-MM-DD');

        console.log(startDate, typeof(startDate))

        const insertQuery = 'INSERT INTO projects (title, start_date, end_date, user_id) VALUES (?, ?, ?, ?)';
        const values = [title, startDate, endDate, userId];
        const project = await new Promise((resolve, reject) => {
            pool.query(insertQuery, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        console.log(project.insertId);

        res.status(201).json({ message: "Project created", project_id: project.insertId});
    } catch (err) {
        if(err.code === "ER_DUP_ENTRY") {
            console.error('Project with this title already exists');
            res.status(500).json({error: "Project with this title already exists"});
            return;
        }
        console.error('Error creating project:', err.code);
        res.status(500).json({error: "Failed to create project in database"});
        return;
    }    
}

const searchProjects = async (req, res) => {
    const {key} = req.query;
    const data = `%${key}%`
    try {
        const selectQuery = 'SELECT * FROM projects WHERE title LIKE ?';
        const results = await new Promise((resolve, reject) => {
            pool.query(selectQuery,[data], (err, results) => {
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
        res.status(500).json({error: "Failed to fetch from database"});
        return;
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

        const projectOwnerId = results[0].user_id;
        const projectOwnername = await new Promise((resolve, reject) => {
            pool.query("SELECT name FROM users WHERE id = ?", [projectOwnerId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if (projectOwnername.length === 0) {
            return res.status(404).json({ error: "Project owner not found" });
        }

        const project = {...results[0], project_owner: projectOwnername[0].name};

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
        const userId = req.user.id;
        const role = req.user.role;

        if(!title || !start_date || !end_date) {
            res.status(400).json({error: "All fields are mandatory"});
            return;
        }

        const selectQuery = 'SELECT user_id from projects where id = ?';
        
        const result = await new Promise((resolve, reject) => {
            pool.query(selectQuery, [projectId], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        })

        if(result.length === 0) {
            console.error(`Project with id ${projectId} not found`);
            res.status(404).json({error: `Project with id ${projectId} not found`});
            return;
        }

        if(result[0].user_id !== userId && role != 'admin') {
            res.status(401).json({error: 'Not authorized to edit this project'});
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
    const userId = req.user.id;
    const role = req.user.role;

    try {
        const selectQuery = 'SELECT user_id from projects where id = ?';
        
        const result = await new Promise((resolve, reject) => {
            pool.query(selectQuery, [projectId], (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        })

        if(result.length === 0) {
            console.error(`Project with id ${projectId} not found`);
            res.status(404).json({error: `Project with id ${projectId} not found`});
            return;
        }
        console.log(result[0].user_id);

        if(result[0].user_id != userId && role != 'admin') {
            res.status(401).json({error: 'Not authorized to edit this project'});
            return;
        }

        // const q = 'SELECT id from tasks where project_id = ?';

        // const r = await new Promise((resolve, reject) => {
        //     pool.query(q, [projectId], (err, result) => {
        //         if (err) {
        //             reject(err);
        //         } else {
        //             resolve(result);
        //         }
        //     });
        // });

        // for(let i = 0; i < r.length; i++) {
        //     const q1 = 'DELETE from comments where task_id = ?';

        //     const r1 = await new Promise((resolve, reject) => {
        //         pool.query(q1, [r[i].id], (err, result) => {
        //             if (err) {
        //                 reject(err);
        //             } else {
        //                 resolve(result);
        //             }
        //         });
        //     });
        // }

        // const q2 = 'DELETE from tasks where project_id = ?';

        // const r2 = await new Promise((resolve, reject) => {
        //     pool.query(q2, [projectId], (err, result) => {
        //         if (err) {
        //             reject(err);
        //         } else {
        //             resolve(result);
        //         }
        //     });
        // });

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

        res.status(200).json({message: `Deleted project for ${req.params.id}`});
    } catch(err) {
        console.error('Error deleting project:', err);
        res.status(500).json({error: "Failed to delete project from database"});
        return;
    }
}

module.exports = {getProjects, createProject, searchProjects, getProject, updateProject, deleteProject}