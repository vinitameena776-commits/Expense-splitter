//bring in our tools
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

//load the  .env file so process.env works
dotenv.config();

//connect to MongoDb
connectDB();

const app = express();

// This line lets our server understand JSON data
// When someone sends data to our API, it comes as JSON
// This line parses it so we can use req.body
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World — Expense Splitter is alive');
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});