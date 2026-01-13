if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const PORT = 10000;
const bcrypt = require("bcrypt");
const users = [];
const initializePassport = require("./passport-config");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodover = require("method-override");

app.use(methodover('_method'))

initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.get("/", checkAuthenticated , (req, res) => {
  res.render("index.ejs", { user: req.user.name });
});
app.get("/login",checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});
app.get("/register",checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});
app.post("/login", (req, res, next) => {
  console.log(req.body, 'loginloginlogin'); // 👈 SEE THIS
  next();
}, passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log(hashedPassword, "hashedPassword-----------");
    users.push({
      id: Date.now().toString(),
      name: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    console.log(users, "users-------");
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
  console.log(users, "users-------");

});

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

app.delete("/logout", (req, res) => {
  req.logOut(function(err) {
    if (err) { return next(err); }
    res.redirect("/login");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
