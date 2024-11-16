const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

const {expensesDB} = require('./../dataBase/db');

/**
 * @swagger
 * /api/expenses/add:
 *   post:
 *     summary: Add an expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Lunch at McDonald's"
 *               amount:
 *                 type: number
 *                 example: 12.50
 *               category:
 *                 type: string
 *                 example: "Food"
 *             required:
 *               - description
 *               - amount
 *               - category
 *     responses:
 *       200:
 *         description: expense added
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/add', authenticateToken, (req, res) => {
    const { description, amount, category} = req.body;
    if (!description || !amount || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const userId = req.user.id;
    const date = new Date().toISOString().slice(0, 10);
    expensesDB.run(
      `INSERT INTO expenses (description, amount, category, date, user_id) VALUES (?, ?, ?, ?, ?)`,
      [description, amount, category, date, userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
      }
    );
  });



/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get an expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the expense
 *     responses:
 *       200:
 *         description: expense retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expense:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 1
 *                     description:
 *                       type: string
 *                       example: "Lunch at McDonald's"
 *                     amount:
 *                       type: number
 *                       example: 12.50
 *                     category:
 *                       type: string
 *                       example: "Food"
 *                     date:
 *                       type: string
 *                       example: "2023-06-01"
 *                     user_id:
 *                       type: string
 *                       example: 1
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Internal server error
*/

router.get('/:id',authenticateToken,(req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Missing ID' });
  }
  expensesDB.get(`SELECT * FROM expenses WHERE user_id = ? AND id = ?`, [userId, id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ expense: row });
  });
});

/**
 * @swagger
 * /api/expenses/delete/{id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the expense
 *     responses:
 *       200:
 *         description: expense deleted
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Internal server error
 */

router.delete('/delete/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Missing ID' });
  }
  expensesDB.run(`DELETE FROM expenses WHERE user_id = ? AND id = ?`, [userId, id],
    function (err) {  
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      res.json({ message: 'Expense Deleted successfully' });
    }
  );
});


/**
 * @swagger
 * /api/expenses/update/{id}:
 *   put:
 *     summary: Update an expense
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the expense
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Dinner at dominos"
 *               amount:
 *                 type: number
 *                 example: 20
 *               category:
 *                 type: string
 *                 example: "Food"
 *             required:
 *               - description
 *               - amount
 *               - category
 *     responses:
 *       200:
 *         description: expense updated
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Internal server error
 * */
router.put('/update/:id', authenticateToken,(req, res) => {

  const userId = req.user.id;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Missing ID' });
  }
  const { description, amount, category } = req.body;
  if (!description || !amount || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  expensesDB.run(
    `UPDATE expenses SET description = ?, amount = ?, category = ? WHERE user_id = ? AND  id = ?`,
    [description, amount, category, userId, id],
    function (err) {  
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      res.json({ message: 'Expense updated successfully' });
    }
  )});


module.exports = router;
