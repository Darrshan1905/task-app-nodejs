const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const pool = require('../config/dbConnection')

const signupUser = async (req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password) {
        res.status(400).json({error: "All fields are mandatory"});
        return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        res.status(400).json({error: "Invalid email format"});
        return;
    }

    if(name.length > 255){
        res.status(400).json({error: "name must be less than 255 characters"});
        return;
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
            res.status(409).json({error: "User with this email already exists"});
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
            res.status(400).json({error: "No user with such id"});
        }
    } catch(err) {
        console.error("Error while signing up user:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
}

const loginUser = async (req, res) => {
    console.log(req.body)
    const {email, password} = req.body;

    console.log(email, password)

    if(!email || !password) {
        res.status(400).json({error: "All fields are mandatory"});
        return;
    }

    try {
        console.log(email, password)
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

        if(results.length > 0 &&  await bcrypt.compare(password, results[0].password)) {
            const accessToken = jwt.sign({
                user: {
                    name: results[0].name,
                    email: results[0].email,
                    id: results[0].id,
                    role: results[0].role
                }
            }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1d"}); 

            res.status(201).json({message: "User successfully logged in ", accessToken, id: results[0].id});
        } else {
            res.status(404).json({error: "User with this email not found or invalid password"});
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
            res.status(409).json({error: "User with this email already exists"});
            return;
        }

        let updateQuery;
        let values;
        if(password && password.length > 5) {
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log(hashedPassword);
            updateQuery = 'UPDATE users set name = ?, email = ?, password = ? where id = ?';
            values = [name, email, hashedPassword, userId];
        } else {
            updateQuery = 'UPDATE users set name = ?, email = ? where id = ?';
            values = [name, email, userId];
        }

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
            pool.query("SELECT * FROM users WHERE id = ?", [userId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        console.log(getUserIdAndEmail);

        if (getUserIdAndEmail.length > 0) {
            const accessToken = jwt.sign({
                user: {
                    name: getUserIdAndEmail[0].name,
                    email: getUserIdAndEmail[0].email,
                    id: getUserIdAndEmail[0].id,
                    role: getUserIdAndEmail[0].role
                }
            }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1d"}); 
            res.status(201).json({message: "User profile updated successfully", id: userId, accessToken});
        } else {
            console.log("User not found with ID:", userId); 
            res.status(400).json({error: "No user with such id"});
        }
    } catch(err) {
        console.error("Error while signing up user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

const deleteAccount = async (req, res) => {
    const userId = req.user.id;
    const deleteQuery = "DELETE FROM users WHERE id = ?";
    try {
        const results = await new Promise((resolve, reject) => {
            pool.query(deleteQuery, [userId], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.status(200).json({message: `Successfully deleted user with id ${userId}`});
    } catch(err) {
        console.error("Error while signing up user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {signupUser, loginUser, updateUser, currUser, deleteAccount}