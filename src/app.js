const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Import the cors middleware
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

dotenv.config();
connectDB();

const app = express();

// Enable CORS for your frontend
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your frontend
  methods: 'GET,POST,PUT,DELETE', // Specify allowed methods
}));

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/restaurants', menuRoutes);
app.use('/api/menu', menuRoutes); 
app.use('/api/reservations', reservationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// removed the aws info