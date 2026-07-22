const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require ("../middleware.js");
const listingController = require("../controllers/listings.js");
const Listing = require("../models/listing.js");

const multer  = require('multer');
const {storage} = require("../cloudConfig.js");

const upload = multer({storage })


 router
.route("/")
.get(wrapAsync(listingController.index))
 .post(
 isLoggedIn,
 upload.single('listing[image]'),
  validateListing,
 wrapAsync(listingController.createListing)
 );
router.get("/search", async (req, res) => {

    let { query } = req.query;

    let listings = await Listing.find({
        $or: [
            { title: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } },
            { country: { $regex: query, $options: "i" } }
        ]
    });


    if(listings.length === 0){

        req.flash(
            "error",
            "Sorry 😔 No listings found for your search!"
        );

        return res.redirect("/listings");
    }


    res.render("listings/search", { listings });

});
 
 router.post(
  "/:id/wishlist",
  isLoggedIn,
  wrapAsync(listingController.toggleWishlist)
);
 //new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

 router
 .route("/:id")
 .get(wrapAsync(listingController.showlistings))
 .put(
isLoggedIn,
isOwner,
 upload.single('listing[image]'),
 validateListing,
 wrapAsync(listingController.updateListing))
 .delete( isLoggedIn,isOwner,
 wrapAsync(listingController.destroyListing));

 router.get("/:id/edit",isLoggedIn,isOwner,
 wrapAsync(listingController.renderEditForm));
 

 module.exports = router;