const express = require('express');
const router = express.Router();
const db = require('./../dataBase/db');



router.post('/add', (req, res) => {
    const { description, amount, category} = req.body;
    const date = new Date().toISOString().slice(0, 10);
    db.run(
      `INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)`,
      [description, amount, category, date],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
      }
    );
  });

router.get('/', (req, res) => {
  db.all(`SELECT * FROM expenses`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ expenses: rows });
  });
});

router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM expenses WHERE id = ?`, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Expense deleted successfully' });
  });
});

router.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { description, amount, category } = req.body;
    db.run(
      `UPDATE expenses SET description = ?, amount = ?, category = ? WHERE id = ?`,
      [description, amount, category, id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Expense updated successfully' });
      }
    )});

  
module.exports = router;