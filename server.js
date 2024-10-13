
// app.listen(
    // port,
    // () => console.log(`Listening on port ${port}`)    
// )


require('dotenv').config();  
const app = require("express")();
const bodyParser = require('body-parser');
const cors = require('cors');
const expensesRoutes = require('./routes/expenses'); 

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// app.get("/", (req, res, next) => {
    // res.write("Hello");
    // next(); //remove 
// });
// 
// app.get("/", (req, res, next) => {
    // res.write(" World !!!");
    // res.end();
// });

app.listen(8080);

app.use('/api/expenses', expensesRoutes);
app.use('/api/auth', require('./routes/auth'));



// Start server
app.listen(PORT,
    () => {console.log(`Server is running on port ${PORT}`);}
);