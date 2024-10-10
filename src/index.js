// src/index.js

const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve images

// Include other middleware and routes
const menuRoutes = require('./routes/menuRoutes');
app.use('/api', menuRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
