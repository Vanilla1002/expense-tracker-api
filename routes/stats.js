const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

const {incomeDB} = require('./../dataBase/db');
const {expensesDB} = require('./../dataBase/db');


/**
 * @swagger
 * /api/stats/sum:
 *   get:
 *     summary: Get the total balance
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The total balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalExpenses:
 *                   type: number
 *                 totalIncomes:
 *                   type: number
 *                 totalBalance:
 *                   type: number
 *               example:
 *                 totalExpenses: 100
 *                 totalIncomes: 200
 *                 totalBalance: 100
 *         500:
 *           description: Internal server error
 */

router.get('/sum',authenticateToken,(req, res) => {
    const userId = req.user.id;

    const expensesQuery = `SELECT SUM(amount) AS totalExpenses FROM expenses WHERE user_id = ?`;
    const incomesQuery = `SELECT SUM(amount) AS totalIncomes FROM incomes WHERE user_id = ?`;
    
    expensesDB.get (expensesQuery, [userId], (err, expensesResult) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        incomeDB.get (incomesQuery, [userId], (err, incomesResult) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const totalExpenses = expensesResult?.totalExpenses || 0;
            const totalIncomes = incomesResult?.totalIncomes || 0;
            const totalBalance = totalIncomes - totalExpenses;
            res.json({ 
                totalExpenses, 
                totalIncomes, 
                totalBalance });
        });
    });
        
});

module.exports = router