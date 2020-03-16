const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    seedDB = require("./seeds"),
    User = require("./models/user"),
    methodOverride = require("method-override");
// REQUIRING ROUTES
const commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");
// mongodb://localhost/yelp_camp
console.log(process.env.DATABASEURL);
mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
// mongoose.connect("mongodb+srv://AdamTarnowski:Rusty_2019@cluster0-bavb7.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //seed the database


//PASSPORT CONFIGURATION

app.use(require("express-session")({
    secret: "This is a secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.locals.moment = require('moment');
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});
