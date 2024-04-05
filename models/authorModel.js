const mongoose = require('mongoose');

const authorSchema = mongoose.Schema({
    authorId: { 
      type: String
    },
    fullName: { 
      type: String 
    },
});

module.exports = mongoose.model("AuthorModel", authorSchema);