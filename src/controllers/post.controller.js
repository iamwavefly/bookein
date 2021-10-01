// import packages
import "babel-polyfill";
import aws from "aws-sdk";
import fs from "fs";
// -- models
import postSchema from "../models/Post.js";
// routes controlles
export const createPost = async (req, res) => {
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
    Key: `blog/assets/images/${req.file.originalname}`,
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
      const postStatus = req.body.approvalCode.includes("itNotASecrete")
        ? "Approved"
        : "Pending";
      let Post = new postSchema({
        ...req.body,
        thumbnail: locationUrl,
        postStatus,
      });
      const newPost = await Post.save();
      if (!newPost)
        return res.status(401).json({ message: "unable to save post" });
      res.status(201).json({ message: "User created successfully", newPost });
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
  try {
    postSchema.findByIdAndDelete(id, (err) => {
      if (err) return res.json({ err });
      res.status(200).json({ message: "post deleted" });
    });
  } catch (error) {
    res.json({ message: error });
  }
};
