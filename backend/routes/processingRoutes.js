import express from 'express'
import sharp from 'sharp'
import path from 'path'
import multer from 'multer'

const router = express.Router()
const upload = multer({ dest: 'uploads/' });

router.route('/').post(upload.single('file'), async (req, res) => {
   try {
    const file = req.file;
    const canvasDimensions = JSON.parse(req.body.canvasDimensions);
    const lanczosImage = await sharp(file.path).resize(
      canvasDimensions.x, 
      canvasDimensions.y,  
      {
      kernel: sharp.kernel.lanczos3,
    });
    const processedImageBuffer = await lanczosImage.toBuffer();
    const processedImageBase64 = processedImageBuffer.toString('base64');
    res.send(processedImageBase64);
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  }
})

export default router;