const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BookModel"
  },
  bookName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BookModel"
  },
  issueDate: {
    type: String,
    trim: true
  },
  specifiedReturnDate: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    trim: true
  },
  actualReturnDate: {
    type: String,
    trim: true
  },
  fineStatus: {
    type: Number,
    trim: true
  },
});

module.exports = mongoose.model("IssueModel", issueSchema);
