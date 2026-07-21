const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  image: {
    url: String,
    filename: String,
  },

  price: Number,
  location: String,
  country: String,

  // geometry: {
  //   type: {
  //     type: String,
  //     enum: ["Point"],
  //     required: true,
  //   },
  //   coordinates: {
  //     type: [Number],
  //      required: true,
  //   },
  // },

  geometry: {
  type: {
    type: String,
    enum: ["Point"],
  },
  coordinates: [Number],
   
},

category: {
    type: String,
    enum: [
        "Trending",
        "Beach",
        "Mountains",
        "Camping",
        "Cabins",
        "Rooms",
        "Forest",
        "Lakefront",
        "City",
        "Luxury",
        "Arctic",
        "Castles",
        "Hidden Gems",
        "Workation",
        "Romantic",
        "Eco Stay"
    ],
    default: "Trending",
},
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({
      _id: { $in: listing.reviews },
    });
  }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;