// import packages
import "babel-polyfill";
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import chalk from "chalk";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import passport from "passport";
import flash from "connect-flash";
import session from "express-session";
import methodOverride from "method-override";
// -- routes
import postRoute from "./routes/post.js";
import userRoute from "./routes/user.js";
// -- private keys
import { mongoURI } from "./config/keys.js";

// init
const server = express();

import { forwardAuthenticated } from "./config/auth.js";

//middleware
server.use(methodOverride("_method"));
server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");
server.set("views", __dirname + "/views/");
server.use("/static", express.static(path.join(__dirname, "./public")));
server.use(express.json());
server.use(morgan("dev"));
// view engine
// -- env
const envConfig = dotenv.config();
if (envConfig.error) {
  throw envConfig.error;
}

require("./config/passport")(passport);

// Express session
server.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
// passport setup
server.use(passport.initialize());
server.use(passport.session());

// Connect flash
server.use(flash());

// Global variables
server.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//-- connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

//-- assign route
server.get("/", forwardAuthenticated, (req, res) => {
  res.render("index", {
    title: "Welcome 👋 to my booking server",
    user: req.user,
  });
});
server.use("/post/", postRoute);
server.use("/user/", userRoute);
//

// port listener
server.set("port", process.env.PORT || 8000);

server.listen(server.get("port"), function () {
  console.log(
    `server started on ${chalk.bgYellow.bold("PORT")} ${chalk.bgRed.bold(
      server.get("port")
    )}`
  );
});
