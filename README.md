# Smart Expense Splitter

A full-stack group expense management application inspired by Splitwise. Built with Node.js, Express, and MongoDB.

## Features

- JWT Authentication — secure register and login
- Group Management — create groups with unique invite codes
- Expense Tracking — add expenses with auto equal split
- Balance Calculator — calculates who owes whom
- Greedy Settlement Algorithm — finds minimum transactions to settle all debts
- Expense Categories — food, travel, accommodation, utilities, entertainment
- Delete Expense — only creator can delete their expense
- RESTful API — consistent response format across all endpoints

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas with Mongoose
- **Authentication:** JWT + bcrypt
- **Deployment:** Render

## API Endpoints

### Auth
- POST /api/auth/register — Register new user
- POST /api/auth/login — Login and get token

### Groups
- POST /api/groups/create — Create a group
- POST /api/groups/join — Join via invite code
- GET /api/groups/mygroups — Get all my groups
- GET /api/groups/:groupId — Get group details

### Expenses
- POST /api/expenses/add — Add expense
- GET /api/expenses/group/:groupId — Get group expenses
- GET /api/expenses/balances/:groupId — Get balances and settlements
- PUT /api/expenses/settle/:expenseId — Settle expense
- DELETE /api/expenses/:expenseId — Delete expense

## Setup Instructions

1. Clone the repository
2. Run `npm install`
3. Create `.env` file with:
   - MONGO_URI=your_mongodb_connection_string
   - PORT=5000
   - JWT_SECRET=your_secret_key
   - NODE_ENV=development
4. Run `npm run dev`

## Project Structure