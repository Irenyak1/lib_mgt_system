const express = require("express");
const router = express.Router();

// Get the User Model
const User = require("../models/User");

// Get add user form
router.get("/users/addUser", (req, res) => {
  if (req.session.user) {
    res.render("add_user", { title: "Add user form" });
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// add user
router.post("/users/addUser", async (req, res) => {
  if (req.session.user) {
    try {
      const user = new User(req.body);
      console.log(user);
      await user.save();
      res.redirect("/users/userlist");
    } catch (err) {
      res.status(400).render("index", { tittle: "Add user" });
      console.log(err);
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// retrieve users from the database
router.get("/users/userlist", async (req, res) => {
  if (req.session.user) {
    try {
      let items = await User.find();
      res.render("users_list", {
        title: "users list",
        users: items,
        currentUser: req.session.user,
      });
    } catch (err) {
      res.status(400).send("Unable to find items in the database");
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// get update user form
router.get("/users/updateUser/:id", async (req, res) => {
  if (req.session.user) {
    try {
      const updateuser = await User.findOne({ _id: req.params.id });
      res.render("edit_user", { user: updateuser });
    } catch (err) {
      res.status(400).send("Unable to find item in the database");
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// post updated user
router.post("/users/updateUser", async (req, res) => {
  if (req.session.user) {
    try {
      await User.findOneAndUpdate({ _id: req.query.id }, req.body);
      res.redirect("/users/userlist");
    } catch (err) {
      res.status(404).send("Unable to update item in the database");
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// delete user
router.post("/users/deleteUser", async (req, res) => {
  if (req.session.user) {
    try {
      await User.deleteOne({ _id: req.body.id });
      res.redirect("back");
    } catch (err) {
      res.status(400).send("Unable to delete item in the database");
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

module.exports = router;
