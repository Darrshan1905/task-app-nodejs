const bcrypt = require('bcrypt');
const pool = require('./dbConnection');

const initialSeeding = async () => {
    let name = "admin1";
    let email = "admin1@gmail.com";
    let password = "password";
    let role = "admin";

    let hashedPassword = await bcrypt.hash(password,10);

    try {
        const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        const values = [name, email, hashedPassword, role];
        await new Promise((resolve, reject) => {
            pool.query(insertQuery, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    } catch(err) {
        console.error("Error while creating admin:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = initialSeeding;