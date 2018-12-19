let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcryptjs');
 
// set up a mongoose model
let UserSchema = new Schema({
    username: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    toObject: {
      virtuals: true
    }, 
    toJSON: {
      virtuals: true
    }
});

//before data is saved 
UserSchema.pre('save', function (next) {
    let user = this;
    //isModified and isNew are mongoose operations to check if particular documents are modified or new to the database
    if (this.isModified('password') || this.isNew) { //check if password has been modified or if password is newly set
      bcrypt.genSalt(10, function (err, salt) { //hash password
        if (err) {
          return next(err);
        }
        bcrypt.hash(user.password, salt, function (err, hash) {
          if (err) {
            return next(err);
          }
          user.password = hash;
          next();
        });
      });
    } else {
      return next();
    }
});

//compare password 
UserSchema.methods.comparePassword = function (passw, cb) {
  bcrypt.compare(passw, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};
 
module.exports = mongoose.model('User', UserSchema);