 if(process.env.NODE_ENV != "production"){
 require('dotenv').config();
 console.log(process.env.MAPTILER_API_KEY);
 }
 const express =  require("express");
 const app = express();
 const mongoose = require("mongoose");
 const path = require("path");
 const methodOverride = require("method-override");
 const ejsMate = require("ejs-mate");
 const ExpressError = require("./utils/ExpressError.js");
const listingRouter  = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { reviewSchema } = require("./schema.js");
const User = require ("./models/user.js");
const bookingRoutes = require("./routes/booking");
const wishlistRouter = require("./routes/wishlist");
 const dns = require("dns"); 

const dbUrl = process.env.ATLASDB_URL;
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function main() {
  await mongoose.connect(dbUrl);
  console.log(" Connected to MongoDB");
}

main()
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

 app.set("view engine", "ejs");
 app.set("views", path.join(__dirname, "views"));
 app.use(express.urlencoded({extended: true}));
 app.use(methodOverride("_method"));
 app.engine("ejs",ejsMate);
 app.use(express.static(path.join(__dirname,"/public")));

 const store =  MongoStore.create({ 
  mongoUrl: dbUrl,
   crypto:{
    secret:process.env.SECRET,
   },
    touchAfter: 24*3600,
 });

  store.on("error", () =>{
    console.log(("Error in MONGO SESSION STORE", err));
  })


const sessionoption = {
 secret:process.env.SECRET,
resave:false,
saveUninitialized: true,
cookie:{
 expire: Date.now() + 7 * 24* 60 * 60 *1000,
maxAge : 7 * 24 * 60* 60 *1000,
httpOnly: true,
},
};

app.use(session(sessionoption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 

app.use((req, res, next)=>{
  console.log("User =>", req.user);
res.locals.success = req.flash("success");
res.locals.error = req.flash("error");
res.locals.currUser = req.user; 
 res.locals.redirectUrl = req.session.redirectUrl;

next();
});

app.use("/listings", listingRouter );
 app.use("/listings/:id/reviews",reviewRouter);
  app.use("/listings/:id/booking", bookingRoutes);
  app.use("/booking", bookingRoutes);
 app.use("/", userRouter);
 app.use("/wishlist", wishlistRouter);
 
 
 app.all(/(.*)/, (req, res, next)=>{
  next(new ExpressError(404, "page not found!"));
 });
app.use((err, req, res, next)=>{
  let{ statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs",{message});
});
 app.listen(8080,() => {
  console.log("server is listening to port 8080");
 });