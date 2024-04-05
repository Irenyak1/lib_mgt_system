const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const registrationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
  },
  mobileNumber:{
    type: String,
    trim:true
  }

});

registrationSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});
module.exports = mongoose.model("Registration", registrationSchema);
