const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbExpensesPath = path.resolve(__dirname, 'expenses.db');
const dbIncomePath = path.resolve(__dirname, 'incomes.db');
const usersPath = path.resolve(__dirname, 'users.db');

const expensesDB = new sqlite3.Database(dbExpensesPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
  expensesDB.run(`
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        amount REAL,
        category TEXT,
        date TEXT,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Expenses table created or already exists.');
    }
  });
});


const incomeDB = new sqlite3.Database(dbIncomePath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
  incomeDB.run(`
    CREATE TABLE IF NOT EXISTS incomes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        amount REAL,
        category TEXT,
        date TEXT,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('income table created or already exists.');
    }
  });
});

const usersDB = new sqlite3.Database(usersPath, (err) => {
  usersDB.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created or already exists.');
    }
  });
});




module.exports = { expensesDB, incomeDB, usersDB };