import express from "express";
import bodyParser from "body-parser";
import { createCanvas, loadImage } from "canvas";
import PDFDocument from "pdfkit";
import fs from "fs";
import puppeteer from "puppeteer";
import pdf from "html-pdf";
// import * as dotenv from "dotenv";
import htmlToImage from "html-to-image";

const router = express.Router();


router.route("/").post(async (req, res) => {
    const { html, canvasDataUrl } = req.body;

  try {
    const image = await loadImage(canvasDataUrl);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    const canvasData = canvas.toDataURL();

    const modifiedHtml = html.replace("{{canvasData}}", canvasData);

    const options = { format: "A4" };
    pdf.create(modifiedHtml, options).toBuffer((err, buffer) => {
      if (err) {
        console.error("Error generating PDF:", err);
        res.status(500).json({ error: "Failed to generate PDF" });
      } else {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");
        res.send(buffer);
      }
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});


export default router;