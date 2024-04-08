const express = require("express");
const router = express.Router();

// Get the Registration model
const AuthorModel = require("../models/authorModel");

// Get add author form
router.get("/authors/addAuthor", (req, res) => {
  if (req.session.user) {
    res.render("add_author", { title: "Register Author form" });
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// add author
router.post("/authors/addAuthor", async (req, res) => {
  if (req.session.user) {
    try {
      const author = new AuthorModel(req.body);
      console.log(author);
      await author.save();
      res.redirect("/authors/authorlist");
    } catch (err) {
      res.status(400).render("add_author", { tittle: "Add author" });
      console.log(err);
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// retrieve uathors from the database
router.get("/authors/authorlist", async (req, res) => {
  if (req.session.user) {
    try {
      let items = await AuthorModel.find();
      res.render("authors_list", {
        title: "authors list",
        authors: items,
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

// update author
// /authors/updateAuthor/
// get update user form
router.get("/authors/updateAuthor/:id", async (req, res) => {
  if (req.session.user) {
    try {
      const updateAuthor = await AuthorModel.findOne({ _id: req.params.id });
      res.render("edit_author", { author: updateAuthor });
    } catch (err) {
      res.status(400).send("Unable to find item in the database");
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// post updated user
router.post("/authors/updateAuthor/", async (req, res) => {
  if (req.session.user) {
    try {
      await AuthorModel.findOneAndUpdate({ _id: req.query.id }, req.body);
      res.redirect("/authors/authorlist");
    } catch (err) {
      res.status(404).send("Unable to update item in the database");
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// Delete author
// /authors/deleteAuthor

router.post("/authors/deleteAuthor", async (req, res) => {
  if (req.session.user) {
    try {
      await AuthorModel.deleteOne({ _id: req.body.id });
      res.redirect("back");
    } catch (err) {
      res.status(400).send("Unable to delete author in the database");
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});



module.exports = router;
