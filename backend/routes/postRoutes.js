import express from 'express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import Post from '../mongodb/models/post.js';

dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.route('/').get(async (req, res) => {
  try {
    const posts = await Post.find({});
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Fetching posts failed, please try again' });
  }
});

router.route('/').post(async (req, res) => {
  try {
    const { name, photo, konvaJSON, draggableData, width, height } = req.body;

    console.log({width}, "width");
    console.log({height}, "height");
  
    // Upload the original image to Cloudinary
    const photoUrl = await cloudinary.uploader.upload(photo);
  
    // Get the public ID of the uploaded image
    const publicId = photoUrl.public_id;
  
    // Generate a URL with the auto_crop transformation applied
    const croppedImageUrl = cloudinary.url(publicId, {
      transformation: [
        { width: width, height: height, crop: "fill" },
        { crop: "crop", gravity: "auto" },
      ],
    });
  
    // Update the photo URL to the cropped image URL
    photoUrl.url = croppedImageUrl;
  
    // Save the new post with the cropped image URL
    const newPost = await Post.create({
      name,
      photo: photoUrl.url,
      konvaJSON,
      draggableData,
    });
  
    res.status(200).json({ success: true, data: newPost, photoUrl: photoUrl.url });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Unable to create a post, please try again',
    });
  }  
});

export default router;