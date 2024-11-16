const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

const {incomeDB} = require('./../dataBase/db');
const {expensesDB} = require('./../dataBase/db');
const { calculateBasicStats } = require('./../mathFunctions');

const { calculateAdvancedStats } = require('./../mathFunctions');




/**
 * @swagger
 * /api/stats/basic:
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



router.get('/basic',authenticateToken,(req, res) => {
    const userId = req.user.id;

    const expensesQuery = `SELECT amount FROM expenses WHERE user_id = ?`;
    const incomesQuery = `SELECT amount FROM incomes WHERE user_id = ?`;
    
    expensesDB.all (expensesQuery, [userId], (err, expenses) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        incomeDB.all (incomesQuery, [userId], (err, incomes) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const result = calculateBasicStats(expenses, incomes);
            const { totalExpenses, totalIncomes, totalBalance } = result;

            res.json({ 
                totalExpenses, 
                totalIncomes, 
                totalBalance });
        });
    });
        
});

/**
 * @swagger
 * /api/stats/incomes:
 *   get:
 *     summary: Get all incomes
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: incomes retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 incomes:
 *                   type: object
 *                   items:
 *                     type: object
 * 
 */

router.get('/incomes',authenticateToken,(req, res) => {
    const userId = req.user.id;
    incomeDB.all(`SELECT * FROM incomes WHERE user_id = ?`, [userId], (err, rows) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json({ expenses: rows });
    });
});


/**
 * @swagger
 * /api/stats/expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: expenses retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expenses:
 *                   type: array
 *                   items:
 *                     type: object
 */


 
router.get('/expenses',authenticateToken,(req, res) => {
    const userId = req.user.id;
    expensesDB.all(`SELECT * FROM expenses WHERE user_id = ?`, [userId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ expenses: rows });
    });
});
  
/**
 * @swagger
 * /api/stats/finances:
 *   get:
 *     summary: Get all finances
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: finances retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expenses:
 *                   type: array
 *                   items:
 *                     type: object
 *                 incomes:
 *                   type: array
 *                   items:
 *                     type: object
 */

router.get('/finances',authenticateToken,(req, res) => {
    const userId = req.user.id;
    const expensesQuery = `SELECT * FROM expenses WHERE user_id = ?`;
    const incomesQuery = `SELECT * FROM incomes WHERE user_id = ?`;
    
    expensesDB.all (expensesQuery, [userId], (err, expensesResult) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        incomeDB.all (incomesQuery, [userId], (err, incomesResult) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ expenses: expensesResult, incomes: incomesResult });
        });
    });
});
    


/**
 * @swagger
 * /api/stats/expenses/advenced:
 *   get:
 *     summary: Get advenced stats
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: advenced stats retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 median:
 *                   type: number
 *                 average:
 *                   type: number
 *                 standardDeviation:
 *                   type: number
 */

router.get('/expenses/advanced',authenticateToken,(req, res) => { // get average, median and standard deviation
    const userId = req.user.id;
    const query = `SELECT amount FROM expenses WHERE user_id = ?`;
    expensesDB.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const stats = calculateAdvancedStats(rows);
        res.json(stats);
    });
});


/** @swagger
 * /api/stats/incomes/advanced:
 *   get:
 *     summary: Get advenced stats
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: advenced stats retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 median:
 *                   type: number
 *                 average:
 *                   type: number
 *                 standardDeviation:
 *                   type: number
 */


router.get('/incomes/advanced',authenticateToken,(req, res) => { // get average, median and standard deviation
    const userId = req.user.id;
    const query = `SELECT amount FROM incomes WHERE user_id = ?`;
    incomeDB.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const stats = calculateAdvancedStats(rows);
        res.json(stats);
    });
});

module.exports = router;
 