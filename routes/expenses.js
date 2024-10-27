const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

const {expensesDB} = require('./../dataBase/db');

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

router.get('/',authenticateToken,(req, res) => {
  const userId = req.user.id;
  expensesDB.all(`SELECT * FROM expenses WHERE user_id = ?`, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ expenses: rows });
  });
});

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
