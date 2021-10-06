// import packages
import express from "express";
import multer from "multer";
import {
  signup,
  login,
  signupIndex,
  loginIndex,
  logout,
  admin,
  deleteUser,
} from "../controllers/user.controller.js";
// init()
const router = express.Router();

import { ensureAuthenticated } from "../config/auth.js";

// setup routes
router.post(
  "/new",
  multer({ dest: "temp/", limits: { fieldSize: 8 * 1024 * 1024 } }).single(
    "photo"
  ),
  signup
);
// signup index page
router.get("/new", signupIndex);

// login
router.post("/login", login);
// signup index page
router.get("/login", loginIndex);
// signup index page
router.get("/logout", logout);
// admin page
router.get("/admin", ensureAuthenticated, admin);
// delete user
router.delete("/delete/:id", deleteUser);

export default router;
