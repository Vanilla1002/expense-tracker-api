function basicStats(expenses, incomes) { // totalExpenses, totalIncomes, totalBalance
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    const totalIncomes = incomes.reduce((total, income) => total + income.amount, 0);
    const totalBalance = totalIncomes - totalExpenses;
    return { totalExpenses, totalIncomes, totalBalance };
}

function theMedian(data) { // median
    if (data.length === 0) 
         return null;
    const sortedData = data.sort((a, b) => a.amount - b.amount);
    if (sortedData.length % 2 === 0) {
        const middleIndex = sortedData.length / 2;
        return (sortedData[middleIndex - 1].amount + sortedData[middleIndex].amount) / 2;
    }

    const middleIndex = Math.floor(sortedData.length / 2);
    return sortedData[middleIndex].amount;
}
function average(data) { // avrage
    if (data.length === 0) 
        return 0;
    return data.reduce((total, income) => total + income.amount, 0) / data.length;
}

function standardDeviation(data, average){// standardDeviation
    if (data.length === 0) 
        return 0;
    const variance = data.reduce((sum, income)=>sum +(Math.pow((income.amount-average),2)))/ data.length;

    return Math.sqrt(variance);
}


function calculateAdvancedStats(data) {
    const median = theMedian(data);
    const avg = average(data);
    const std = standardDeviation(data, avg);
    return { median, average: avg, standardDeviation: std };
}


module.exports = {
    basicStats,
    theMedian,
    average,
    standardDeviation,
    calculateAdvancedStats
}