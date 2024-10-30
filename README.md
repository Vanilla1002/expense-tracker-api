# Expense Tracker API
The Expense Tracker API allows users to add, update, delete, and categorize their expenses, with features for user authentication and optional statistics generation.

## Features
- Expense Management: Add, update, delete expenses with categories like food, entertainment, etc.
- Authentication: Secure routes with JWT-based authentication.
- Statistics Generation: Option to generate statistics for expenses.
- Interactive Documentation: View and test API endpoints with Swagger UI.

## Technologies Used
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Authentication**: JWT (jsonwebtoken), bcryptjs for password hashing
- **Documentation**: Swagger UI
- *Other Libraries*:
  - dotenv: Environment variable management
  - cors: Cross-Origin Resource Sharing
  - body-parser: Parse incoming request bodies
 
## Setup and Installation
1. Clone the repository:
```
git clone https://github.com/yourusername/expense-tracker-api.git
cd expense-tracker-api
```
2. Install dependencies:
```
npm install
```
3. Set up env:
```
JWT_SECRET=your_jwt_secret_key
```
4. Run:
```
npm start
```
The projects runs on port 3000, you can explore endpoints at localhost:3000/docs

