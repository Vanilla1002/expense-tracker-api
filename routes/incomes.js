const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

const {incomeDB} = require('./../dataBase/db');


/**
 * @swagger
 * /api/incomes/add:
 *   post:
 *     summary: Add an income
 *     tags: [Incomes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "first paycheck"
 *               amount:
 *                 type: number
 *                 example: 1000
 *               category:
 *                 type: string
 *                 example: "job at Google"
 *             required:
 *               - description
 *               - amount
 *               - category
 *     responses:
 *       200:
 *         description: Income added successfully
 *       400:
 *         description: Missing required fields
 */

router.post('/add' ,authenticateToken,(req,res) =>{

  const { description, amount, category} = req.body;
  if (!description || !amount || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const userId = req.user.id;
  const date = new Date().toISOString().slice(0, 10);
  incomeDB.run(
      `INSERT INTO incomes (description, amount, category, date, user_id) VALUES (?, ?, ?, ?, ?)`,
      [description, amount, category, date, userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
          res.json({ id: this.lastID });
        }
    )
});



/**
 * @swagger
 * /api/incomes/{id}:
 *   get:
 *     summary: Get an income
 *     tags: [Incomes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the income
 *     responses:
 *       200:
 *         description: Income retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 income:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string 
 *                       example: 1
 *                     description:
 *                       type: string
 *                       example: "first paycheck"
 *                     amount:
 *                       type: number 
 *                       example: 1000
 *                     category:
 *                       type: string
 *                       example: "job at Google"
 *                     date:
 *                       type: string
 *                       example: "2022-01-01"
 *
 */

router.get('/:id',authenticateToken,(req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Missing ID' });
  }
  incomeDB.get(`SELECT * FROM incomes WHERE user_id = ? AND id = ?`, [userId, id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Income not found' });
    }
    res.json({ income: row });
  });
});

/**
 * @swagger
 * /api/incomes/delete/{id}:
 *   delete:
 *     summary: Delete an income
 *     tags: [Incomes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the income
 *     responses:
 *       200:
 *         description: Income deleted successfully
 *       400:
 *         description: Missing ID
 *       404:
 *         description: Income not found
 */

router.delete('/delete/:id', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Missing ID' });
  }
  incomeDB.run(`DELETE FROM incomes WHERE user_id = ? AND id = ?`, [userId, id],
    function (err) {  
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Income not found' });
      }
      res.json({ message: 'Income deleted successfully' });
    }
  );
});

/**
 * @swagger
 * /api/incomes/update/{id}:
 *   put:
 *     summary: Update an income
 *     tags: [Incomes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the income
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "first paycheck"  
 *               amount:
 *                 type: number
 *                 example: 1000
 *               category:  
 *                 type: string
 *                 example: "job at Google"
 *     responses:
 *       200:
 *         description: Income updated successfully
 *       400:
 *         description: Missing ID
 *       404:
 *         description: Income not found
 */

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
  incomeDB.run(
    `UPDATE incomes SET description = ?, amount = ?, category = ? WHERE user_id = ? AND  id = ?`,
    [description, amount, category, userId, id],
    function (err) {  
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Income not found' });
      }
      res.json({ message: 'Income updated successfully' });
    }
  )});

module.exports = router;