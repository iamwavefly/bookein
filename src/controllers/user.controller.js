// import package
import aws from "aws-sdk";
import fs from "fs";
import bcrypt from "bcryptjs";
import passport from "passport";
import moment from "moment";

// -- models
import User from "../models/User.js";
import Post from "../models/Post.js";
// routes controlles
export const signup = async (req, res) => {
  const { fullname, email, username, password, password2 } = req.body;
  let errors = [];

  if (!fullname || !email || !username || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (!req.file) {
    errors.push({ msg: "Please select profile photo" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("signup", {
      title: "It's free | Create your account now!",
      errors,
      fullname,
      email,
      username,
      password,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("signup", {
          title: "It's free | Create your account now!",
          errors,
          fullname,
          email,
          username,
          password,
          password2,
        });
      } else {
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
          Key: `booking/assets/images/photo/${req.file.originalname}`,
        };
        // upload photo to s3
        s3.upload(params, async (err, data) => {
          if (err) {
            console.log(
              "Error occured while trying to upload to S3 bucket",
              err
            );
          }
          // check for res
          if (data) {
            fs.unlinkSync(req.file.path); // Empty temp folder
            const locationUrl = data.Location;
            // save user to db
            let newUser = new User({
              ...req.body,
              photo: locationUrl,
            });
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                  .save()
                  .then((user) => {
                    req.flash(
                      "success_msg",
                      "You are now registered and can log in"
                    );
                    res.redirect("/user/login");
                  })
                  .catch((err) => console.log(err));
              });
            });
          }
        });
      }
    });
  }
};
export const signupIndex = async (req, res) => {
  res.render("signup", {
    title: "It's free | Create your account now!",
  });
};
export const login = async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/login",
    failureFlash: true,
  })(req, res, next);
};
export const loginIndex = async (req, res) => {
  res.render("login", {
    title: "Sigin to contact me",
  });
};
export const logout = async (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/");
};
// admin index
export const admin = async (req, res) => {
  const posts = await Post.find().populate("postedBy");
  res.render("admin", {
    user: req.user,
    title: "Admin | Manage all appointments booking",
    posts,
    formatDate: moment,
  });
};
// delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // find user and delete
    User.findByIdAndDelete(id, async (err) => {
      if (err) return res.json({ err });

      Post.exists({ postBy: id }, async (err, posts) => {
        if (err) {
          req.flash("error_msg", "sorry, error occur");
          res.redirect("/user/admin");
        }
        if (posts) {
          await Post.deleteMany({ postBy: id });
        }
      });
      req.flash("success_msg", "User deleted 👍");
      res.redirect("/user/admin");
    });
  } catch (error) {
    res.json({ message: error });
  }
};
