const express = require("express");
const router = express.Router();
const passport = require("passport");
// const mongoose = require("mongoose");
// const multer = require("multer")

// Get the models
const Registration = require("../models/Registration");
const AuthorModel = require("../models/authorModel");
const BookModel = require("../models/bookModel");
const IssueModel = require("../models/issueModel");
const User = require("../models/User");

// Get Admin signup form
router.get("/register", (req, res) => {
  res.render("signup", { title: "Signup form" });
});

// Register admin
router.post("/register", async (req, res) => {
  try {
    const items = new Registration(req.body);
    await Registration.register(items, req.body.password, (err) => {
      if (err) {
        throw err;
      }
      res.redirect("/login");
    });
  } catch (err) {
    res.status(400).send("Sorry! Something went wrong.");
    console.log(err);
  }
});

// Get login form
router.get("/login", (req, res) => {
  res.render("login");
});

// Login admin
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/admin/dashboard");
  }
);

//Logged in admin getting their dashboard
router.get("/admin/dashboard", async (req, res) => {
  if (req.session.user) {
    try {
      let authors = await AuthorModel.find();
      let numAuthors = await AuthorModel.countDocuments();

      let users = await User.find();
      let numUsers = await User.countDocuments();

      let varbooksInLib = await BookModel.find();
      let numVarBooksInLib = await BookModel.countDocuments();

      let borrowedBooks = await BookModel.find({ status: "borrowed" });
      let numBorrowedBooks = await BookModel.countDocuments({
        status: "borrowed",
      });

      let availableBooks = await BookModel.find({ status: "available" });
      // let numAvailableBooks = await BookModel.countDocuments({ status: 'available' });
      let numAvailableBooks = await BookModel.aggregate([
        { $match: { status: "available" } },
        {
          $group: {
            _id: null, // Group by null to calculate across all documents
            totalCopiesAvailable: { $sum: "$numCopies" }, // Sum up the 'copies' field from all documents
          },
        },
      ]);

      //  Total copies for all books
      let aggregationResult = await BookModel.aggregate([
        {
          $group: {
            _id: null, // Group by null to calculate across all documents
            totalCopies: { $sum: "$numCopies" }, // Sum up the 'copies' field from all documents
          },
        },
      ]);
      // console.log("all users", users)
      // console.log("copies available:",numAvailableBooks)
      console.log("copies:", aggregationResult);
      // console.log("authors No:",authors)
      // console.log("No of users in the system:",users)
      // console.log("No of Books in Lib:",varbooksInLib)
      // console.log("No of Borrowed books: ",borrowedBooks)

      res.render("admin_dashboard", {
        numAuthors: numAuthors,
        numUsers: numUsers,
        numVarBooksInLib: numVarBooksInLib,
        numBorrowedBooks: numBorrowedBooks,
        availableBooks: numAvailableBooks[0],
        copies: aggregationResult[0],
        title: "Admin Dashboard",
        currentUser: req.session.user,
      });
    } catch (err) {
      // res.status(400).send("Unable to find details from the db");
      console.log("Error", err);
    }
  } else {
    console.log("cant find session");
    res.redirect("/login");
  }
});

// Logout route
router.get("/logout", (req, res) => {
  if (req.session) {
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Error logging out");
      }
      // Redirect to login page after logout
      res.redirect("/login");
    });
  }
});

module.exports = router;
