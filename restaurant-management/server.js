// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3000;

// ====== Middleware ======
app.use(cors());
app.use(express.json()); // Parse JSON body

// ====== MySQL Connection ======
const db = mysql.createConnection({
  host: "localhost",
  user: "root",                     // Your MySQL username
  password: "DBMS",                 // Your MySQL password
  database: "RestaurantManagementSystem" // Your database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    process.exit(1);
  }
  console.log("✅ MySQL connected successfully!");
});

// ===================== MENU ROUTES =====================

// Get all menu items
app.get("/menu", (req, res) => {
  db.query("SELECT * FROM menu", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage });
    res.json(results);
  });
});

// Add new menu item
app.post("/menu", (req, res) => {
  const { dish_name, price, ingredients, kcal } = req.body;

  if (!dish_name || !price || !ingredients || !kcal) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  const sql = "INSERT INTO menu (dish_name, price, ingredients, kcal) VALUES (?, ?, ?, ?)";
  db.query(sql, [dish_name, price, ingredients, kcal], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage });
    res.json({ message: "Dish added successfully!", id: result.insertId });
  });
});

// Update menu item
app.put("/menu/:id", (req, res) => {
  const { id } = req.params;
  const { dish_name, price, ingredients, kcal } = req.body;

  if (!dish_name || !price || !ingredients || !kcal) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  const sql = "UPDATE menu SET dish_name=?, price=?, ingredients=?, kcal=? WHERE id=?";
  db.query(sql, [dish_name, price, ingredients, kcal, id], (err) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage });
    res.json({ message: "Dish updated successfully!" });
  });
});

// Delete menu item
app.delete("/menu/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM menu WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage });
    res.json({ message: "Dish deleted successfully!" });
  });
});

// Search menu items by dish name or ingredients
app.get("/search", (req, res) => {
  const searchTerm = req.query.q;
  if (!searchTerm) return res.status(400).json({ error: "Please provide a search term ?q=" });

  const likeTerm = `%${searchTerm}%`;
  const sql = `
    SELECT * FROM menu 
    WHERE dish_name LIKE ? OR ingredients LIKE ?`;
  db.query(sql, [likeTerm, likeTerm], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage });
    res.json(results);
  });
});

// ===================== CONTACT ROUTES =====================
app.post("/contact", (req, res) => {
  const { customer_name, email, phone_num, message } = req.body;
  if (!customer_name || !email || !phone_num || !message) {
    return res.status(400).json({ error: "All fields are required!" });
  }
  const sql = "INSERT INTO contact_info (customer_name, email, phone_num, message) VALUES (?, ?, ?, ?)";
  db.query(sql, [customer_name, email, phone_num, message], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage });
    res.json({ message: "Contact info saved successfully!", id: result.insertId });
  });
});

app.get("/contacts", (req, res) => {
  db.query("SELECT * FROM contact_info", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage });
    res.json(results);
  });
});

// ===================== FEEDBACK ROUTES =====================
app.post("/submit-feedback", (req, res) => {
  const { name, email, rating, message } = req.body;
  if (!name || !email || !rating || !message) {
    return res.status(400).json({ success: false, message: "All fields are required!" });
  }
  const sql = "INSERT INTO feedback (name, email, rating, message) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, rating, message], (err, result) => {
    if (err) {
      console.error("❌ Error inserting feedback:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, message: "Thank you! Your feedback has been submitted." });
  });
});

app.get("/feedbacks", (req, res) => {
  db.query("SELECT * FROM feedback ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    res.json(results);
  });
});

// ===================== CATEGORY ROUTES =====================

// Get all categories
app.get("/categories", (req, res) => {
  db.query("SELECT * FROM categories", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage });
    res.json(results);
  });
});

// Add new category
app.post("/categories", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Category name required!" });

  const sql = "INSERT INTO categories (name) VALUES (?)";
  db.query(sql, [name], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.sqlMessage });
    res.json({ message: "Category added successfully!", id: result.insertId });
  });
});

// ===================== START SERVER =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
