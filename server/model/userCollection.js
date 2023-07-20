const mongoose = require("mongoose");
const validator = require("validator");
const uniqueValidator = require("mongoose-unique-validator");
const passwordValidator = require("password-validator");
const bcrypt = require("bcryptjs");

var passSchema = new passwordValidator();
passSchema
  .is()
  .min(8)
  .is()
  .max(60)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(2)
  .has()
  .not()
  .spaces()
  .has()
  .symbols();

const usersSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      uppercase: true,
      minLength: 3,
      trim: true,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      validate: (value) => {
        if (!validator.isEmail(value)) {
          throw new Error("{PATH} format is wrong");
        }
      },
      required: true,
    },
    password: {
      type: String,
      trim: true,
      validate: (value) => {
        if (!passSchema.validate(value))
          throw new Error(
            passSchema.validate(value, { details: true })[0].message
          );
      },
      required: true,
    },
    isOnline:{
      type: Boolean,
      default: false
    },
    isAvatarImageSet: {
      type: Boolean,
      default: false,
    },
    avatarImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

usersSchema.plugin(uniqueValidator, {
  message: "Error, {PATH} already exists.",
});

//converting password into hash
usersSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User = new mongoose.model("user", usersSchema);

module.exports = User;
