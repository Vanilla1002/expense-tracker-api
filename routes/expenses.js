const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

const {expensesDB} = require('./../dataBase/db');
const {incomeDB} = require('./../dataBase/db');

router.post('/add', authenticateToken, (req, res) => {
    const { description, amount, category} = req.body;
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
  const { id } = req.params;
  expensesDB.run(`DELETE FROM expenses WHERE id = ?`, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Expense deleted successfully' });
  });
});

router.put('/update/:id', authenticateToken,(req, res) => {
    const { id } = req.params;
    const { description, amount, category } = req.body;
    expensesDB.run(
      `UPDATE expenses SET description = ?, amount = ?, category = ? WHERE id = ?`,
      [description, amount, category, id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Expense updated successfully' });
      }
    )});


router.get('/check', (req, res) => {
  expensesDB.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (rows.length > 0) {
      res.json({ message: 'Expenses table exists.' });
    } else {
      res.json({ message: 'Expenses table does not exist.' });
    }
  });
});
  
module.exports = router;