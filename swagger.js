const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Expense Tracker API',
      version: '2.0.0',
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
      {
        name: 'Auth',
        description: 'User authentication and account management',
      },
      {
        name: 'AI',
        description: 'Interact with the AI financial assistant',
      },
      {
        name: 'Expenses',
        description: 'Operations related to user expenses (CRUD, stats)',
      },
      {
        name: 'Incomes',
        description: 'Operations related to user incomes (CRUD, stats)',
      },
      {
        name: 'Stats',
        description: 'Retrieve basic and advanced statistics of expenses and incomes',
      },
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);


module.exports = swaggerDocs;