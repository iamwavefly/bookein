export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error_msg", "Please log in to view that resource");
  res.redirect("/user/login");
};
export function forwardAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  } else if (req.user.username === "admin") {
    return res.redirect("/user/admin");
  } else {
    return next();
  }
}
