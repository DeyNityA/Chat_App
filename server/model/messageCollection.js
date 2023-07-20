const mongoose = require("mongoose");

const MessageSchema =new mongoose.Schema(
  {
    msg: {
      type: String,
       required: true 
    },
    sendTo: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true,
    },
    sendBy: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = new mongoose.model("message", MessageSchema);
module.exports = Message;