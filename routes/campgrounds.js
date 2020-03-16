const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware");


// INDEX - SHOW ALL CAMPGROUNDS
router.get("/", function (req, res) {
    //get all campgrounds from DB
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds, page: "campgrounds" });
        }
    })
});

// CREATE - CREATE NEW CAMPGROUNDS
router.post("/", middleware.isLoggedIn, function (req, res) {
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = { name: name, price: price, image: image, description: description, author: author };
    //creat a new campground and save to DB
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    })
})

// NEW - SHOW FORM TO CREATE NEW CAMPGROUNDS
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

//SHOW - SHOWS MORE INFO ABOUT ONE CAMPGROUND
router.get("/:id", function (req, res) {
    //find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            //render show template with that campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        res.render("campgrounds/edit", { campground: foundCampground });
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            //redirect 
            res.redirect("/campgrounds/" + req.params.id)
        }
    });

});

//DESTROY CAMPGROUND
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds")
        }
        else {
            res.redirect("/campgrounds");
        }
    });
});


module.exports = router;