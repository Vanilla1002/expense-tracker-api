# Expense Tracker API

The Expense Tracker API allows users to add, update, delete, and categorize their expenses, with features for user authentication and statistics generation.  
The latest version integrates a **Large Language Model (LLM)** via **Google Generative AI**, enabling the API to understand and process **natural language financial commands**.

## Features

- **Expense Management:** Add, update, delete expenses with categories like food, entertainment, etc.  
- **Authentication:** Secure routes with JWT-based authentication.  
- **Statistics Generation:** Generate statistics for expenses and income.  
- **LLM-Powered Commands:** Use natural language instructions (e.g., “Add $50 for groceries yesterday”) that are interpreted by Google Generative AI to automatically execute actions.  
- **Interactive Documentation:** Explore and test API endpoints with Swagger UI.

## Technologies Used

- **Backend:** Node.js, Express  
- **Database:** SQLite  
- **Authentication:** JWT (`jsonwebtoken`), `bcryptjs`  
- **LLM Integration:** Google Generative AI for interpreting financial commands  
- **Documentation:** Swagger UI  
- **Other Libraries:**  
  - `dotenv` – environment variable management  
  - `cors` – Cross-Origin Resource Sharing  
  - `body-parser` – parse incoming request bodies  

## Setup and Installation

1. Clone the repository:  
   ```bash
   git clone https://github.com/Vanilla1002/expense-tracker-api.git
   cd expense-tracker-api
   ```

2. Install dependencies:  
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:  
   ```env
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_API_KEY=your_google_api_key
   ```

4. Start the server:  
   ```bash
   npm start
   ```

The API runs on **port 3000**, and you can explore endpoints with Swagger at `http://localhost:3000/docs`

## About

The Expense Tracker API now leverages **LLM-powered natural language understanding**, making it possible for users to interact with their financial data using human-like instructions instead of strictly structured requests.

