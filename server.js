

require('dotenv').config();  
const app = require("express")();
const bodyParser = require('body-parser');
const cors = require('cors');
const expensesRoutes = require('./routes/expenses'); 
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger');


const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());


app.listen(8080);

app.use('/api/expenses', expensesRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/incomes', require('./routes/incomes'));
app.use('/api/stats', require('./routes/stats'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/ai', require('./routes/ai'));


// Start server
app.listen(PORT,
    () => {console.log(`Server is running on port ${PORT}`);}
);