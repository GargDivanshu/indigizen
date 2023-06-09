import express from 'express'


const router = express.Router()

router.route('/').post(async (req, res) => {
    try {
      const { name,  photo } = req.body;
      const photoUrl = await cloudinary.uploader.upload(photo);
  
      const newPost = await Post.create({
        name,
        photo: photoUrl.url,
      });
  
      res.status(200).json({ success: true, data: newPost });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Unable to create a post, please try again' });
    }
  });
  
export default router;