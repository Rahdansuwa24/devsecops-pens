const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Endpoint 1: Sales Summary
app.get('/api/sales-summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        (SELECT SUM(quantityOrdered * priceEach) FROM orderdetails) as totalRevenue, 
        (SELECT COUNT(DISTINCT orderNumber) FROM orders) as totalOrders, 
        (SELECT COUNT(*) FROM customers) as totalCustomers
    `);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint 2: Top Products
app.get('/api/top-products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.productName, 
        SUM(od.quantityOrdered) as totalQuantity 
      FROM orderdetails od 
      JOIN products p ON od.productCode = p.productCode 
      GROUP BY p.productCode 
      ORDER BY totalQuantity DESC 
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint 3: Monthly Sales
app.get('/api/monthly-sales', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(orderDate, '%Y-%m') as month, 
        SUM(od.quantityOrdered * od.priceEach) as revenue 
      FROM orders o 
      JOIN orderdetails od ON o.orderNumber = od.orderNumber 
      GROUP BY month 
      ORDER BY month ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
