const pool = require('../config/dbConnection')

const checkTaskExists = (taskId, projectId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id FROM tasks WHERE id = ? and project_id = ?';
        pool.query(query, [taskId, projectId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0);
            }
        });
    });
};

const getProjectOwner = async (projectId) => {
    const result = await new Promise((resolve, reject) =>{ 
        const query = 'SELECT user_id from projects WHERE id = ?';
        pool.query(query, [projectId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        })
    })
    return result[0].user_id;
}

const getCommenterId = async (commentId) => {
    const result = await new Promise((resolve, reject) =>{ 
        const query = 'SELECT user_id from comments WHERE id = ?';
        pool.query(query, [commentId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        })
    })

    if(result.length === 0) {
        return 0;
    } 
    return result[0].user_id;
} 

const getComments = async (req, res) => {
    const project_id = req.params.project_id;
    const task_id = req.params.task_id;

    const taskExists = await checkTaskExists(task_id, project_id);

    if(!taskExists) {
        res.status(404).json({ error: `Task with ID ${task_id} not found` });
        return;
    }

    try {
        const selectQuery = 'SELECT * FROM comments where task_id = ?';
        const results = await new Promise((resolve, reject) => {
            pool.query(selectQuery, [task_id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({error: "Failed to fetch from database"});
        return;
        // throw new Error('Failed to fetch from database');
    }
}

const createComment = async (req, res) => {
    console.log("Request body: ", req.body);
    
    const project_id = req.params.project_id;
    const task_id = req.params.task_id;

    const {description} = req.body;

    if(!description) {
        res.status(400).json({error: "Description field is mandatory"});
        return;
    }

    const taskExists = await checkTaskExists(task_id, project_id);

    if(!taskExists) {
        res.status(404).json({ error: `Task with ID ${task_id} not found for project with ID ${project_id}` });
        return;
    }

    try {
        const insertQuery = 'INSERT INTO comments (commenter, body, task_id, user_id) VALUES (?, ?, ?, ?)';
        console.log(req.user.name);
        const values = [req.user.name, description, task_id, req.user.id];
        const comment = await new Promise((resolve, reject) => {
            pool.query(insertQuery, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.status(201).json({ message: "Comment created successfully", comment_id: comment.insertId});
    } catch (err) {
        console.error('Error creating comment:', err);
        res.status(500).json({error: `Failed to create comment for the task id ${task_id} in database`});
        return;
    }
}

const deleteComment = async (req, res) => {
    const project_id = req.params.project_id;
    const task_id = req.params.task_id;
    const comment_id = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    const taskExists = await checkTaskExists(task_id, project_id);

    if(!taskExists) {
        res.status(404).json({ error: `Task with ID ${task_id} not found` });
        return;
    }

    const projectUserId = await getProjectOwner(project_id);
    const commenterId = await getCommenterId(comment_id);

    if(commenterId === 0) {
        res.status(404).json({error: `No comment with id ${comment_id} found for this task`});
        return;
    }

    if(projectUserId != userId && commenterId != userId && role != 'admin') {
        res.status(401).json({error: "Not authorized to delete this comment"});
        return;
    }

    try {
        const query = `DELETE FROM comments WHERE id = ? and task_id = ?`;

        const results = await new Promise((resolve, reject) => {
            pool.query(query, [comment_id, task_id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if(results.affectedRows === 0) {
            console.error(`Comment with id ${comment_id} not found for this task`);
            res.status(404).json({error: `Comment with id ${comment_id} not found for this task`});
            return;
        }        

        res.status(200).json({message: `Deleted comment for ${comment_id}`});
    } catch(err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({error: "Failed to delete comment"});
        return;
    }
}

module.exports = {getComments, createComment, deleteComment};

