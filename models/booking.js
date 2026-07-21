const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    checkIn: Date,
    checkOut: Date,

    guests: {
        type: Number,
        default: 1,
    },

    totalPrice: Number,

    status: {
        type: String,
        default: "Confirmed",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Booking", bookingSchema);