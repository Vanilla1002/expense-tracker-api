const {incomeDB} = require('./../dataBase/db');
const {expensesDB} = require('./../dataBase/db');
const { calculateBasicStats } = require('./mathFunctions');

//expense functions

async function addExpense(description, amount, category, date, userId) {
    return new Promise((resolve, reject) => {
        if (!date) {
            date = new Date().toISOString().slice(0, 10);
        }
        expensesDB.run(
            `INSERT INTO expenses (description, amount, category, date, user_id) VALUES (?, ?, ?, ?, ?)`,
            [description, amount, category, date, userId],
            function (err) {
                if (err) {
                    return reject(err);
                }
                resolve({ id: this.lastID });
            }
        );
    });
}

function searchExpenses(userId, filters) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM expenses WHERE user_id = ?`;
    const params = [userId];

    if (filters && filters.category) {
      query += ` AND category LIKE ?`;
      params.push(`%${filters.category}%`);
    }

    if (filters && filters.date) {
      query += ` AND date(date) = date(?)`;
      params.push(filters.date);
    }

    if (filters && filters.amount) {
      query += ` AND amount = ?`;
      params.push(filters.amount);
    }

    expensesDB.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getExpenseStats(userId, startDate, endDate) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM expenses WHERE user_id = ?`;
        const params = [userId];

        if (startDate) {
            query += ` AND date >= ?`;
            params.push(startDate);
        }

        if (endDate) {
            query += ` AND date <= ?`;
            params.push(endDate);
        }

        expensesDB.all(query, params, (err, rows) => {
            if (err) {
                return reject(err);
            }
            const stats = calculateBasicStats(rows);
            resolve(stats);
        });
    });
}

//income functions

async function addIncome(description, amount, category, userId) {
    return new Promise((resolve, reject) => {
        const date = new Date().toISOString().slice(0, 10);
        incomeDB.run(
            `INSERT INTO incomes (description, amount, category, date, user_id) VALUES (?, ?, ?, ?, ?)`,
            [description, amount, category, date, userId],
            function (err) {
                if (err) {
                    return reject(err);
                }
                resolve({ id: this.lastID });
            }
        );
    });
}

function searchIncomes(userId, filters) {
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM incomes WHERE user_id = ?`;
    const params = [userId];

    if (filters && filters.category) {
      query += ` AND category LIKE ?`;
      params.push(`%${filters.category}%`);
    }

    if (filters && filters.date) {
      query += ` AND date(date) = date(?)`;
      params.push(filters.date);
    }

    if (filters && filters.amount) {
      query += ` AND amount = ?`;
      params.push(filters.amount);
    }

    incomeDB.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
function getIncomeStats(userId, startDate, endDate) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM incomes WHERE user_id = ?`;
        const params = [userId];

        if (startDate) {
            query += ` AND date >= ?`;
            params.push(startDate);
        }

        if (endDate) {
            query += ` AND date <= ?`;
            params.push(endDate);
        }

        incomeDB.all(query, params, (err, rows) => {
            if (err) {
                return reject(err);
            }
            const stats = calculateBasicStats(rows);
            resolve(stats);
        });
    });
}

// statistics functions
function getOverallStats(userId, startDate, endDate) {
    return new Promise(async (resolve, reject) => {
        try {
            const expenseStats = await getExpenseStats(userId, startDate, endDate);
            const incomeStats = await getIncomeStats(userId, startDate, endDate);

            resolve({
                expenses: expenseStats,
                incomes: incomeStats
            });
        } catch (err) {
            reject(err);
        }
    });
}

function getTotalBalance(userId) {
    return new Promise((resolve, reject) => {
        incomeDB.get(`SELECT SUM(amount) as total_income FROM incomes WHERE user_id = ?`, [userId], (err, incomeRow) => {
            if (err) {
                return reject(err);
            }
            expensesDB.get(`SELECT SUM(amount) as total_expense FROM expenses WHERE user_id = ?`, [userId], (err, expenseRow) => {
                if (err) {
                    return reject(err);
                }
                const totalIncome = incomeRow.total_income || 0;
                const totalExpense = expenseRow.total_expense || 0;
                const balance = totalIncome - totalExpense;
                resolve(balance);
            });
        });
    });
}

module.exports = {
    addExpense,
    searchExpenses,
    getExpenseStats,
    addIncome,
    searchIncomes,
    getIncomeStats,
    getOverallStats,
    getTotalBalance
};