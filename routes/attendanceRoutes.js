const express = require('express');
const multer = require('multer');
const path = require('path');
const attendanceController = require('../controllers/attendanceController');

const router = express.Router();

// Configure multer for file uploads
const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
const uploadMiddleware = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        }
    }),
    fileFilter: (req, file, cb) => {
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            cb(null, true);
        } else {
            cb(new Error('Error: File type not allowed!'));
        }
    }
});

// Define route for file upload and student attendance calculation
router.post('/uploadAndCalculate', uploadMiddleware.single('attendanceFile'), attendanceController.uploadFileAndCalculateAttendance);

module.exports = router;
