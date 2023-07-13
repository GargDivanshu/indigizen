import express from 'express';
import * as dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

dotenv.config();

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;

    // Generate a unique filename for the PDF
    const uniqueFilename = `${Date.now()}.pdf`;
    const filePath = `uploads/${uniqueFilename}`;

    // Save the PDF blob to disk
    fs.renameSync(file.path, filePath);

    res.json({ success: true, message: 'PDF saved successfully' });
  } catch (error) {
    console.error('Error saving PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to save PDF' });
  }
});

export default router;
