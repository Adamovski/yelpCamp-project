const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    seedDB = require("../seeds"),
    User = require("../models/user");


mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();

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
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.get("/", function (req, res) {
    res.render("landing");
});
// INDEX - SHOW ALL CAMPGROUNDS
app.get("/campgrounds", function (req, res) {
    //get all campgrounds from DB
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds });
        }
    })
});
// CREATE - CREATE NEW CAMPGROUNDS
app.post("/campgrounds", function (req, res) {
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = { name: name, image: image, description: description };
    //creat a new campground and save to DB
    Campground.create(newCampground, function (err, newlyCreates) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    })
})
// NEW - SHOW FORM TO CREATE NEW CAMPGROUNDS
app.get("/campgrounds/new", function (req, res) {
    res.render("campgrounds/new");
});

//SHOW - SHOWS MORE INFO ABOUT ONE CAMPGROUND
app.get("/campgrounds/:id", function (req, res) {
    //find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});
// ==================
// COMMENTS ROUTES
// ==================

// NEW - SHOW FORM TO CREATE NEW COMMENTS
app.get("/campgrounds/:id/comments/new", isLoggedIn, function (req, res) {
    //find campground by id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    })
});

app.post("/campgrounds/:id/comments", isLoggedIn, function (req, res) {
    //lookup campground using id
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            console.log(req.body.comment);
            //create new comment
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    //connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    //redirect to campground show page
                    res.redirect("/campgrounds/" + campground._id)
                }
            })
        }
    })
})

// ===========
// AUTH ROUTES
// ===========
//show register form
app.get("/register", function (req, res) {
    res.render("register");
});
//handle register logic
app.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        //log user in
        passport.authenticate("local")(req, res, function () {
            res.redirect("campgrounds");
        });
    });
});
// show login form
app.get("/login", function (req, res) {
    res.render("login");
});
//handling login logic
app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function (req, res) {
    }
);
//logout route
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/campgrounds")
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

app.listen(3000, function () {
    console.log("The YelpCamp server has started")
});