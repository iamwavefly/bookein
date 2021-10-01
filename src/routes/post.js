// import packages
import express from "express";
import multer from "multer";
import {
  createPost,
  findAllPost,
  findSinglePost,
  deletePost,
} from "../controllers/post.controller.js";
// init()
const router = express.Router();
// setup routes
router.post(
  "/new",
  multer({ dest: "temp/", limits: { fieldSize: 8 * 1024 * 1024 } }).single(
    "thumbnail"
  ),
  createPost
);
// find all posts
router.get("/all", findAllPost);
// find single posts
router.get("/:slug", findSinglePost);
// delete specific post
router.delete("/delete/:id", deletePost);

export default router;
