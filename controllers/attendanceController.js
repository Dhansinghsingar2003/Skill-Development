const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');


const extractTextFromFile = async (filePath) => {
    const fileExt = path.extname(filePath).toLowerCase();
    console.log(`Processing file with extension: ${fileExt}`);

    
    if (!['.pdf', '.png', '.jpg', '.jpeg'].includes(fileExt)) {
        throw new Error('Unsupported file type. Please upload a PDF, PNG, or JPG file.');
    }

    
    const data = new FormData();
    data.append('apikey', 'K87692110088957'); 
    data.append('file', fs.createReadStream(filePath));
    data.append('OCREngine', '2'); 
    data.append('isTable', 'True'); 

    const config = {
        method: 'post',
        url: 'https://api.ocr.space/parse/image',
        headers: {
            ...data.getHeaders(),
        },
        data: data,
    };

    try {
        const response = await axios(config);
        if (response.data && response.data.ParsedResults && response.data.ParsedResults.length > 0) {
            const extractedText = response.data.ParsedResults[0].ParsedText;
            console.log('Extracted Text:\n', extractedText);
            return extractedText;
        } else {
            console.error('No parsed results found in the OCR response.');
            throw new Error('No parsed results found in the OCR response.');
        }
    } catch (error) {
        console.error('Error extracting text from OCR.space API:', error.message);
        throw new Error(`Error extracting text from file: ${error.message}`);
    }
};

exports.uploadFileAndCalculateAttendance = async (req, res) => {
    try {
        const file = req.file;
        const fullName = req.body.fullName;
        const enrollmentNumber = req.body.enrollmentNumber;

        const extractedText = await extractTextFromFile(file.path);
        const rawText = extractedText; 

        const lines = rawText.trim().split('\n');
        let studentAttendance = null;

        
        for (const line of lines) {
            if (line.includes(enrollmentNumber) && line.includes(fullName)) {
               
                const attendanceRecord = line.split(/\s+/).slice(3); // Use regex to split by whitespace
                const presentCount = attendanceRecord.filter(status => status.toUpperCase() === 'P').length;
                const absentCount = attendanceRecord.filter(status => status.toUpperCase() === 'A').length;

                studentAttendance = {
                    fullName,
                    enrollmentNumber,
                    present: presentCount,
                    absent: absentCount
                };
                break;
            }
        }

        if (!studentAttendance) {
            return res.status(404).json({ message: 'Student not found', fullName, enrollmentNumber });
        }

        res.json({
            message: 'File uploaded and attendance calculated!',
            attendance: studentAttendance
        });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'An error occurred while processing the file.' });
    }
};
