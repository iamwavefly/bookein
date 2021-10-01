import mongoose from "mongoose";
import slugify from "slugify";
// import dompurify from "dompurify";
// import { JSDOM } from "jsdom";
import marked from "marked";
const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
  },
  tags: {
    type: Array,
  },
  category: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  sanitizedHtml: {
    type: String,
    required: true,
  },
  approvalCode: {
    type: String,
    required: true,
  },
  postStatus: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

// config domepurify
// const createDomPurify = dompurify(new JSDOM().window);

PostSchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
    });
  }
  if (this.content) {
    this.sanitizedHtml = marked(this.content);
  }
  next();
});

const Post = mongoose.model("Post", PostSchema);

export default Post;
