const express = require("express");
const router = express.Router({ mergeParams: true });
const bookingController = require("../controllers/booking.js");
const Booking = require("../models/booking");
console.log("Booking Route Loaded");
const { isLoggedIn } = require("../middleware");

// My Trips
router.get("/my-trips", isLoggedIn, async(req,res)=>{
    let bookings = await Booking.find({
        user: req.user._id
    })
    .populate("listing")
    .populate("user");
    res.render("booking/index.ejs", { bookings });

});
// Booking Details

router.get("/:bookingId", isLoggedIn, async(req,res)=>{
    let { bookingId } = req.params;
    let booking = await Booking.findById(bookingId)
        .populate("listing")
        .populate("user");
    if(!booking){
        req.flash("error","Booking not found");
        return res.redirect("/booking/my-trips");
    }

    res.render("booking/show.ejs",{ booking });

});
router.delete("/:bookingId", isLoggedIn, async (req, res) => {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        req.flash("error", "Booking not found!");
        return res.redirect("/booking/my-trips");
    }
    if (!booking.user.equals(req.user._id)) {
        req.flash("error", "You are not authorized!");
        return res.redirect("/booking/my-trips");
    }

    booking.status = "Cancelled";
    await booking.save();

    req.flash("success", "Booking cancelled successfully!");
    res.redirect("/booking/my-trips");
});
router.post("/", isLoggedIn, bookingController.createBooking);
console.log("Booking POST Hit");

module.exports = router;