const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ROLES = require('../constants/role');

const Schema = mongoose.Schema;
const SALT_ROUNDS = 10;

const userSchema = new Schema({
  firstName: { type: String, required: true, trim: true, default: '' },
  lastName: { type: String, required: true, trim: true, default: '' },
  email: { type: String, unique: true, required: true, trim: true },
  password: { type: String, select: false },
  role: { type: String, required: true, enum: Object.values(ROLES), default: ROLES.USER },
});

userSchema.methods.hashPassword = function hashPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
      if (err) {
        return reject('Failed to generate hash');
      }
      return resolve(hash);
    });
  });
};

userSchema.methods.authenticate = function authenticate(password) {
  return new Promise((resolve, reject) => {
    bcrypt
      .compare(password, this.password, function(err, allow){
        if (allow){
          return resolve();
        }else{
          return reject();
        }
      })
  });
};
userSchema.pre('save', function preSave(next) {
  if (this.password && this.isModified('password')) {
    this.password = this.hashPassword(this.password)
    .then((password) => {
      this.password = password;
      next();
    })
    .catch(next);
  } else {
    next();
  }
});

module.exports = mongoose.model('User', userSchema);
