const { Query } = require("mongoose");
const Listing = require("../models/listing");
const User = require("../models/user");

const { geocoding, config } = require("@maptiler/client");

config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    const { category } = req.query;

    let allListing;

    if (category) {
        allListing = await Listing.find({ category });
        if (allListing.length === 0) {
            req.flash("error", `No ${category} listings found 😔`);
            return res.redirect("/listings");
        }

    } else {
        allListing = await Listing.find({});

    }
    res.render("listings/index", {
        allListing,
        category
    });
};

 module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
}

module.exports.createListing = async (req, res) => {
console.log(req.body);
 const result = await geocoding.forward(
  req.body.listing.location,
  { limit: 1 }
);

 console.log(result);

  let url = req.file.path;
  let filename = req.file.filename;
  

  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  if (result.features.length > 0) {
    newListing.geometry = result.features[0].geometry;
  }

  let savedListing = await newListing.save();
  console.log(savedListing);

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

   module.exports.renderEditForm = async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(req.params.id);
    if(!listing){
       req.flash("error","Listings you requested for does not exist");
       return res.redirect("/listings");
     } 
   

   let originalImageUrl = listing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs",{listing,
        originalImageUrl});
};

   module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing },
          { new: true });

    if(req.file){
    let url =  req.file.path;
    let filename = req.file.filename;

    listing.image = {url, filename};
    await listing.save();
    }
     req.flash("success", "Listing Updated!")
     res.redirect(`/listings/${id}`);
   };
  
   module.exports.destroyListing = async(req, res) =>{
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!")
  res.redirect("/listings");
}



module.exports.toggleWishlist = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(req.user._id);

  const index = user.wishlist.indexOf(id);

  if (index === -1) {
    user.wishlist.push(id);
    req.flash("success", "Added to Wishlist ❤️");
  } else {
    user.wishlist.splice(index, 1);
    req.flash("success", "Removed from Wishlist 💔");
  }

  await user.save();

  res.redirect(`/listings/${id}`);
};

module.exports.showlistings = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listings you requested for does not exist");
    return res.redirect("/listings");
  }

   const isSaved = req.user?.wishlist?.includes(listing._id) || false;

  res.render("listings/show.ejs", {
    listing,
    isSaved,
    mapToken: process.env.MAPTILER_API_KEY,
  });
};
