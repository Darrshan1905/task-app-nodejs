const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const pool = require('../config/dbConnection')

const signupUser = async (req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password) {
        res.status(400).json({error: "All fields are mandatory"});
    }

    try {
        const selectQuery = 'SELECT email FROM users where email = ?';
        const results = await new Promise((resolve , reject) => {
            pool.query(selectQuery, [email], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            })
        })

        if(results.length > 0) {
            res.status(409).json({message: "User with this email already exists"});
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        const values = [name, email, hashedPassword];
        const user = await new Promise((resolve, reject) => {
            pool.query(insertQuery, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        console.log(user);

        const insertId = user.insertId;

        const getUserIdAndEmail = await new Promise((resolve, reject) => {
            pool.query("SELECT id, email FROM users WHERE id = ?", [insertId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        console.log(getUserIdAndEmail);

        if (getUserIdAndEmail.length > 0) {
            const userId = getUserIdAndEmail[0].id;
            const userEmail = getUserIdAndEmail[0].email;
            res.status(201).json({message: "User signed up successfully", id: userId, email: userEmail});
        } else {
            console.log("User not found with ID:", insertId);
        }
    } catch(err) {
        console.error("Error while signing up user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

const loginUser = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password) {
        res.status(400).json({error: "All fields are mandatory"});
    }

    try {
        const selectQuery = 'SELECT * FROM users where email = ?';
        const results = await new Promise((resolve, reject) => {
            pool.query(selectQuery, [email], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            })
        })

        if(results.length > 0) {
            await new Promise((resolve, reject) => {
                bcrypt.compare(password, results[0].password, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
            })

            const accessToken = jwt.sign({
                user: {
                    name: results[0].name,
                    email: results[0].email,
                    id: results[0].id,
                    role: results[0].role
                }
            }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1h"}); 

            res.status(201).json({message: "User successfully logged in ", accessToken});
        } else {
            res.status(404).json({message: "User with this email not found"});
            return;
        }
    } catch (err) {
        console.error("Error while signing up user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

const currUser = async (req, res) => {
    res.status(200).json(req.user);
}

const updateUser = async (req, res) => {
    const userId = req.user.id;

    const {name, email, password} = req.body;

    if(!name || !email) {
        res.status(400).json({error: 'Name and email are madatory fields'});
        return;
    }

    try {
        const selectQuery = 'SELECT id FROM users where email = ? and id != ?';
        const results = await new Promise((resolve , reject) => {
            pool.query(selectQuery, [email, userId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            })
        })

        if(results.length > 0) {
            res.status(409).json({message: "User with this email already exists"});
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        const updateQuery = 'UPDATE users set name = ?, email = ?, password = ? where id = ?';
        const values = [name, email, hashedPassword, userId];
        const user = await new Promise((resolve, reject) => {
            pool.query(updateQuery, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        const getUserIdAndEmail = await new Promise((resolve, reject) => {
            pool.query("SELECT id, email FROM users WHERE id = ?", [userId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        console.log(getUserIdAndEmail);

        if (getUserIdAndEmail.length > 0) {
            const userId = getUserIdAndEmail[0].id;
            const userEmail = getUserIdAndEmail[0].email;
            res.status(201).json({message: "User signed up successfully", id: userId, email: userEmail});
        } else {
            console.log("User not found with ID:", userId); 
            res.status(400).json({error: "No user with such id"});
        }
    } catch(err) {
        console.error("Error while signing up user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {signupUser, loginUser, updateUser, currUser}