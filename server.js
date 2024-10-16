

require('dotenv').config();  
const app = require("express")();
const bodyParser = require('body-parser');
const cors = require('cors');
const expensesRoutes = require('./routes/expenses'); 

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());



app.listen(8080);

app.use('/api/expenses', expensesRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/incomes', require('./routes/incomes'));


// Start server
app.listen(PORT,
    () => {console.log(`Server is running on port ${PORT}`);}
);