const express = require("express");
const router = express.Router();

// Get the BookModel model
const BookModel = require("../models/bookModel");
const IssueModel = require("../models/issueModel");
const AuthorModel = require("../models/authorModel");
const User = require("../models/User");

// Get add book form
router.get("/books/addBook", async (req, res) => {
  if (req.session.user) {
    // let authorlist = await AuthorModel.find();
    let items = await AuthorModel.find();
    // console.log("my list of authors:", authorlist);
    res.render("add_book", {
      authors: items,
      title: "Register Book form",
    });
    console.log("These are authors", items)
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// add book
router.post("/books/addBook", async (req, res) => {
  if (req.session.user) {
    try {
      const book = new BookModel(req.body);
      console.log("my new book", book);
      await book.save();
      res.redirect("/books/booklist");
    } catch (err) {
      res.status(400).render("add_book", { tittle: "Add book" });
      console.log(err);
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// retrieve books from the database
router.get("/books/booklist", async (req, res) => {
  if (req.session.user) {
    try {
      let items = await BookModel.find().populate('authorName', 'fullName').exec()
      if (req.query.genre) {
        items = await BookModel.find({ genre: req.query.genre });
      }
      res.render("books_list", {
        title: "Books list",
        books: items,
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

// get update book form
router.get("/books/updateBook/:id", async (req, res) => {
  if (req.session.user) {
    try {
      const updateBook = await BookModel.findOne({ _id: req.params.id });
      res.render("edit_book", { book: updateBook });
    } catch (err) {
      res.status(400).send("Unable to find item in the database");
      console.log(err)
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// update book
router.post("/books/updateBook", async (req, res) => {
  if (req.session.user) {
    try {
      await BookModel.findByIdAndUpdate({ _id: req.query.id }, req.body);
      res.redirect("/books/booklist");
    } catch (err) {
      res.status(404).send("Unable to update item in the database");
      console.log("Book update error", err)
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// delete book
router.post("/books/deleteBook", async (req, res) => {
  if (req.session.user) {
    try {
      await BookModel.deleteOne({ _id: req.body.id });
      res.redirect("back");
    } catch (err) {
      res.status(400).send("Unable to delete item in the database");
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// ISSUE BOOK AND RETURN BOOK ROUTES
// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// Express route to borrow a book from the library
router.get("/books/issueBook/:id", async (req, res) => {
  // const bookId = req.params.bookId;
  if (req.session.user) {
    try {
      let users = await User.find();
      // let vbooks = await BookModel.find()
      const bookIssue = await BookModel.findOne({ _id: req.params.id });
      res.render("issue_book", { book: bookIssue, users: users });
    } catch (err) {
      res.status(400).send("Unable to find item in the database");
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// router.post('/books/issueBookxxxx', async (req, res) => {
//   try {
//       // const { bookId } = req.body; // Assuming you send the bookId in the request body

//       // Find the book by ID and decrement the copies count
//       // let book = await BookModel.findByIdAndUpdate(bookId, { $inc: { numCopies: -1 } }, { new: true });
//       let book = await BookModel.findByIdAndUpdate({_id: req.query.id }, req.body, { $inc: { numCopies: -1 } }, { new: true });

//       // If the book was not found or there were no copies left, send an appropriate error response
//       if (!book || book.numCopies <= 0) {
//           return res.status(404).json({ message: 'Book not found or no copies available' });
//       }

//       book = new IssueModel(req.body);
//       console.log("Book borrowed", book);
//       await book.save();

//       // If the copies count was successfully decremented, send a success response
//       // res.json({ message: 'Book borrowed successfully' });
//       res.redirect("/bookList");
//   } catch (err) {
//       console.error(err);
//       res.status(500).send('Internal Server Error');
//   }
// });

// // Issuing routes
// // Get issue book form
// router.get("/issueBook/:id", async (req, res) => {
//   if (req.session.user) {
//     try {
//       const issueBook = await BookModel.findOne({ _id: req.params.id });
//       res.render("issue_book", { issueBook: issueBook });
//     } catch (err) {
//       res.status(400).send("Unable to find item in the database");
//     }
//   } else {
//     console.log("Can't find session");
//     res.redirect("/login");
//   }
// });
// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  neeneneeennew
// Route to borrow a book
router.post("/books/issueBook", async (req, res) => {
  // const bookId = req.params.bookId;
  if (req.session.user) {
    try {
      // Find the book by its ID in the Books collection
      const book = await BookModel.findById({ _id: req.params.id });

      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      // Check if there are available copies of the book
      if (book.numCopies <= 0) {
        return res.status(400).json({ message: "No copies available" });
      }

      // Update the number of copies in the Books collection
      book.numCopies -= 1;
      console.log("new copies", book.numCopies);
      await book.save();

      // Create a new BorrowedBook document
      const borrowedBook = new IssueModel({
        borrower: req.body.borrower, // Assuming borrower is provided in the request body
        bookId: book.bookId,
        bookName: book.bookName,
        issueDate: new Date(),
        specifiedReturnDate: req.body.specifiedReturnDate,
        status: req.body.status,
      });

      // Save the borrowed book to the BorrowedBooks collection
      await borrowedBook.save();

      return res
        .status(200)
        .json({ message: "Book borrowed successfully", borrowedBook });
      // res.redirect('/books/booklist')
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

// // update book
// router.post("/issueBook", async (req, res) => {
//   if (req.session.user) {
//     try {
//       // save to IssueModel
//       await BookModel.findOneAndUpdate({ _id: req.query.id }, req.body);
//       res.redirect("books_list");
//     } catch (err) {
//       res.status(404).send("Unable to update item in the database");
//     }
//   } else {
//     console.log("Can't find session");
//     res.redirect("/login");
//   }
// });

// retrieve list of issued books from the database
router.get("/books/issuedBooklist", async (req, res) => {
  if (req.session.user) {
    try {
      // pick from IssueModel
      let items = await BookModel.find();
      if (req.query.genre) {
        items = await BookModel.find({ genre: req.query.genre });
      }
      res.render("issued_books_list", {
        title: "Borrowed Books",
        issuedbooks: items,
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

// Return book routes
// Get return book form(like update route)
router.get("/books/returnBook", (req, res) => {
  if (req.session.user) {
    // add code to fetch details of book returned
    res.render("return_book", { title: "return Book form" });
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

// return book(works as update book)
router.post("/books/returnBook", async (req, res) => {
  if (req.session.user) {
    try {
      const bookreturn = new BookModel(req.body);
      console.log(bookreturn);
      await bookreturn.save();
      res.redirect("/books/booklist");
    } catch (err) {
      res.status(400).render("return_book", { tittle: "return book" });
      console.log(err);
    }
  } else {
    console.log("Can't find session");
    res.redirect("/login");
  }
});

module.exports = router;
