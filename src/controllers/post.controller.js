// import packages
import "babel-polyfill";
import aws from "aws-sdk";
import fs from "fs";
// -- models
import postSchema from "../models/Post.js";
// routes controlles
export const submitForm = async (req, res) => {
  // aws config
  aws.config.setPromisesDependency();
  aws.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.REGION,
  });
  const s3 = new aws.S3();
  var params = {
    ACL: "public-read",
    Bucket: process.env.BUCKET_NAME,
    Body: fs.createReadStream(req.file.path),
    Key: `booking/assets/images/${req.file.originalname}`,
  };
  // upload image to aws
  s3.upload(params, async (err, data) => {
    if (err) {
      console.log("Error occured while trying to upload to S3 bucket", err);
    }
    // check for res
    if (data) {
      fs.unlinkSync(req.file.path); // Empty temp folder
      const locationUrl = data.Location;
      // save user to db
      let Post = new postSchema({
        ...req.body,
        document: locationUrl,
        postedBy: req.user.id,
      });
      const newPost = await Post.save();
      if (!newPost)
        return res.status(401).json({ message: "unable to save post" });
      req.flash("success_msg", "Submitted, Thanks.");
      res.redirect("/");
    }
  });
};
// find all post
export const findAllPost = async (req, res) => {
  const posts = await postSchema.find().sort({ date: "desc" });
  if (!posts) return res.status(401).json({ message: "no post found" });
  res.status(200).json({ message: posts });
};
// find single post
export const findSinglePost = async (req, res) => {
  const { slug } = req.params;
  const post = await postSchema.findOne({ slug });
  if (!post) return res.status(404).json({ message: "no post found" });
  res.status(200).json({ message: post });
};
// delete post
export const deletePost = (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    postSchema.findByIdAndDelete(id, (err) => {
      if (err) return res.json({ err });
      req.flash("success_msg", "Appointment deleted 👍");
      res.redirect("/user/admin");
    });
  } catch (error) {
    res.json({ message: error });
  }
};
