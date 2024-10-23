const {usersDB} = require('./../dataBase/db');

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();


router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    usersDB.run(
        `INSERT INTO users (username, password) VALUES (?, ?)`,
        [username, hashedPassword],
        function (err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: err.message});
            }
            res.json({ message: `User registered successfully{${this.lastID}}` });
        }
    );
  });


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const row = await new Promise((resolve, reject) => {
            usersDB.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
                if (err) {
                    return reject(err);
                }
                return resolve(row);
            });
        });

        if (!row) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const passwordMatch = await bcrypt.compare(password, row.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: row.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
        res.json({ token });
        

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
  });

module.exports = router