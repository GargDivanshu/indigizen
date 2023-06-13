import express from "express";
import bodyParser from "body-parser";
// import PDFDocument from "pdfkit";
import fs from "fs";
import puppeteer from "puppeteer";
import pdf from "html-pdf";
import { PDFDocument, rgb } from 'pdf-lib';
import { createCanvas, loadImage, registerFont } from 'canvas'

// import * as dotenv from "dotenv";
import htmlToImage from "html-to-image";

const router = express.Router();


router.route("/").post(async (req, res) => {
  try {
    const { image, draggableData } = req.body;

    // Create a canvas to composite the image and draggable data
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

    // Draw the image on the canvas
    const img = await loadImage(image);
    ctx.drawImage(img, 0, 0);

    // Draw the draggable data text on the canvas
    draggableData.forEach((data) => {
      const { text, x, y } = data;
      ctx.font = '16px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText(text, x, y);
    });

    // Generate the PDF
    const pdfDoc = new pdfKit();
    pdfDoc.pipe(res);

    pdfDoc.image(canvas.toBuffer(), {
      fit: [pdfDoc.page.width, pdfDoc.page.height],
    });

    pdfDoc.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});


export default router;