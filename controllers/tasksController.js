const pool = require('../config/dbConnection');

const checkProjectExists = (projectId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id FROM projects WHERE id = ?';
        pool.query(query, [projectId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0);
            }
        });
    });
};

const getTasks = async (req, res) => {
    const project_id = req.params.project_id;

    const projectExists = await checkProjectExists(project_id);

    if(!projectExists) {
        res.status(404).json({ error: `Project with ID ${project_id} not found` });
        return;
    }

    try {
        const selectQuery = 'SELECT * FROM tasks where project_id = ?';
        const results = await new Promise((resolve, reject) => {
            pool.query(selectQuery, [project_id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if(results.length === 0) {
            res.status(200).json({message: "No tasks for this project yet!"});
            return;
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({error: "Failed to fetch from database"});
        return;
        // throw new Error('Failed to fetch from database');
    }
}

const createTask = async (req, res) => {
    console.log("Request body: ", req.body);
    const project_id = req.params.project_id;
    const {name, duration, description} = req.body;

    if(!name || !duration) {
        res.status(400).json({error: "Task name and duration fields are mandatory"});
        return;
    }

    const projectExists = await checkProjectExists(project_id);

    if(!projectExists) {
        res.status(404).json({ error: `Project with ID ${project_id} not found` });
        return;
    }

    try {
        const insertQuery = 'INSERT INTO tasks (name, duration, description, project_id) VALUES (?, ?, ?, ?)';
        const values = [name, duration, description, project_id];
        await new Promise((resolve, reject) => {
            pool.query(insertQuery, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.status(201).json({ message: "Task created" });
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({error: `Failed to create task for the project id ${project_id} in database`});
        return;
    }
}

const updateTask = async (req, res) => {
    const project_id = req.params.project_id;
    const task_id = req.params.id;

    const projectExists = await checkProjectExists(project_id);

    if(!projectExists) {
        res.status(404).json({ error: `Project with ID ${project_id} not found` });
        return;
    }

    const {name, duration, description} = req.body;

    if(!name || !duration) {
        res.status(400).json({error: "Task name and duration fields are mandatory"});
        return;
    }

    try {
        const updateQuery = `UPDATE tasks SET name = ?, duration = ?, description = ? WHERE id = ? and project_id = ?`;
        const values = [name, duration, description, task_id, project_id];

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
            console.error(`Task with id ${task_id} not found for this project`);
            res.status(404).json({error: `Task with id ${task_id} not found for this project`});
            return;
        }

        res.status(200).json({message: `Updated task for id ${task_id}`});
    } catch(err) {
        console.error('Error updating task:', err);
        res.status(500).json({error: "Failed to update database"});
        return;
    }
}

const deleteTask = async (req, res) => {
    const project_id = req.params.project_id;
    const task_id = req.params.id;

    const projectExists = await checkProjectExists(project_id);

    if(!projectExists) {
        res.status(404).json({ error: `Project with ID ${project_id} not found` });
        return;
    }

    try {
        const q = 'DELETE FROM comments WHERE task_id = ?'
        
        const r = await new Promise((resolve, reject) => {
            pool.query(q, [task_id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        const query = `DELETE FROM tasks WHERE id = ? and project_id = ?`;

        const results = await new Promise((resolve, reject) => {
            pool.query(query, [task_id, project_id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if(results.affectedRows === 0) {
            console.error(`Task with id ${task_id} not found for this project`);
            res.status(404).json({error: `Task with id ${task_id} not found for this project`});
            return;
        }        

        res.status(200).json({message: `Deleted task for ${task_id}`});
    } catch(err) {
        console.error('Error deleting task:', err);
        res.status(500).json({error: "Failed to delete task"});
        return;
    }
}

module.exports = {getTasks, createTask, updateTask, deleteTask}