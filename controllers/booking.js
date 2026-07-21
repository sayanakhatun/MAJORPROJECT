const { models } = require("mongoose");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const Review = require ("../models/review");

module.exports.createBooking = async (req, res) => {
 console.log("Controller Started");
    const listing = await Listing.findById(req.params.id);

    
    const {
        checkIn,
        checkOut,
        guests
    } = req.body;

    const days =
        Math.ceil(
            (new Date(checkOut) - new Date(checkIn))
            / (1000 * 60 * 60 * 24)
        );

    const totalPrice = listing.price * days;

    const booking = new Booking({
        listing: listing._id,
        user: req.user._id,
        checkIn,
        checkOut,
        guests,
        totalPrice,
    });

    await booking.save();

    req.flash("success", "Booking Confirmed 🎉");

    res.redirect(`/listings/${listing._id}`);
};