const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Load User model
import User from "../models/User.js";

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "username" },
      (username, password, done) => {
        // Match user
        User.collection
          .findOne({
            username: username,
          })
          .then((user) => {
            if (!user) {
              console.log("That username is not registered");
              return done(null, false, {
                message: "That username is not registered",
              });
            }

            // Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                return done(null, user);
              } else {
                console.log("password incorrect");
                return done(null, false, { message: "Password incorrect" });
              }
            });
          });
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
