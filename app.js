const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");

const expressSession = require("express-session")({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  });
  
require("dotenv").config();

// import models
const Registration = require("./models/Registration");

const port = process.env.port || 4100;

// import routes
const indexRoutes = require("./routes/indexRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authorRoutes = require("./routes/authorRoutes")
const bookRoutes = require("./routes/bookRoutes")
const userRoutes = require("./routes/userRoutes")


//instantiate the app
const app = express();

// set db connection to mongoose
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection
  .once("open", () => {
    console.log("Mongoose connection open");
  })
  .on("error", err => {
    console.error(`Connection error: ${err.message}`);
 });

//set view engine to pug
// app.engine('pug', require('pug').__express);//new pug requires this line to work
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
// app.use('/public/images', express.static(__dirname + '/public/images'))
app.use(express.urlencoded({ extended: true })); //new way
// app.use(express.json());
app.use(cors());

// express session configs
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());

// passport configs
passport.use(Registration.createStrategy());
passport.serializeUser(Registration.serializeUser());
passport.deserializeUser(Registration.deserializeUser());

//Use imported routes
app.use("/", indexRoutes);
app.use("/", adminRoutes);
app.use("/", authorRoutes);
app.use("/", bookRoutes);
app.use("/", userRoutes);


//for invalid routes
app.get("*", (req, res) => {
  res.render("404");
});

//set app to listen to the specified port
app.listen(port, err => {
  if (err) {
    return console.log("Error", err);
  }
  console.log(`App running on port ${port}`);
});


