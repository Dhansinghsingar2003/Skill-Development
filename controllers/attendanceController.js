const path = require('path');
const Tesseract = require('tesseract.js');
const pdfPoppler = require('pdf-poppler');

const extractTextFromFile = async (filePath) => {
    const fileExt = path.extname(filePath).toLowerCase();

    if (fileExt === '.pdf') {
        
        const outputDir = path.dirname(filePath);
        const outputBaseName = path.basename(filePath, path.extname(filePath));
        const options = {
            format: 'png',  // Convert PDF to PNG
            out_dir: outputDir,
            out_prefix: outputBaseName,
            page: null // Convert all pages
        };

        try {
            await pdfPoppler.convert(filePath, options);
            const imagePath = path.join(outputDir, `${outputBaseName}-1.png`); // Assuming first page is named like this
            return await Tesseract.recognize(imagePath, 'eng');
        } catch (error) {
            throw new Error(`Error converting PDF: ${error.message}`);
        }
    } else {
        return await Tesseract.recognize(filePath, 'eng');
    }
};

exports.uploadFileAndCalculateAttendance = async (req, res) => {
    try {
        const file = req.file;
        const fullName = req.body.fullName;
        const enrollmentNumber = req.body.enrollmentNumber;

       
        const extractedText = await extractTextFromFile(file.path);
        const rawText = extractedText.data.text;

        const lines = rawText.trim().split('\n');
        let studentAttendance = null;


        for (const line of lines) {
            if (line.includes(enrollmentNumber) && line.includes(fullName)) {
                const attendanceRecord = line.split(' ').slice(3); 
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

        // Respond with the calculated attendance for the student
        res.json({
            message: 'File uploaded and attendance calculated!',
            attendance: studentAttendance
        });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'An error occurred while processing the file.' });
    }
};















