import express from 'express';
import * as dotenv from 'dotenv';
import  Offset from './../mongodb/models/offset.js';


dotenv.config();

const router = express.Router();



router.route('/').get(async (req, res) => {
  try {
    // const posts = await Post.find({});
    
    res.status(200).json({
        message: 'Hello from OffsetRoutes!',
      });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Fetching posts failed, please try again' });
  }
});

router.route('/').post(async (req, res) => {
  try {
    // Save the new post with the cropped image URL
    const test_obj = [{x: 1, y: 2}, {x: 3, y: 4}]
    const newPost = await Offset.create(test_obj);
    console.log('req.body', req.body)
  
    res.status(200).json({ success: true, data: newPost });
    console.log('newPost', newPost)
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Unable to create a post, please try again',
      
    });
    console.log(err)
  }  
});

export default router;