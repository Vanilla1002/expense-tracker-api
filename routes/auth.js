const {usersDB} = require('./../dataBase/db');

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:  
 *                 type: string
 *                 example: "vanilla"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: User registered successfully
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
    }
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user     
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:  
 *                 type: string
 *                 example: "vanilla"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Internal server error
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
    }
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
        res.json({ loggedIn: true, token });
        

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
  });

module.exports = router