const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const attendanceRoutes = require('./routes/attendanceRoutes');

// Create an instance of Express
const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Use the attendance routes for handling uploads
app.use('/api', attendanceRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    const currentDateTime = new Date();
    console.log(`Server started on http://localhost:${PORT} on ${currentDateTime.toLocaleDateString()} at ${currentDateTime.toLocaleTimeString()}`);
});
