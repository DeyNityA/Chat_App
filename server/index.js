require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userroute");
const User = require("./model/userCollection");
mongoose
  .connect(`${process.env.MONGO_URL}`)
  .then(() => console.log("Connected!"))
  .catch((err) => console.log(err));

const app = express();

const server = http.createServer(app);
var io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  const UserId = socket.handshake.auth.token;

  socket.on("add-user", async (userId) => {
    try {
      onlineUsers.set(userId, socket.id);
      socket.broadcast.emit("online-user", userId);
      await User.findOneAndUpdate(
        { _id: userId },
        { $set: { isOnline: true } }
      );
    } catch (err) {
      console.log(err.message);
    }
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      console.log("sending");
      socket
        .to(sendUserSocket)
        .emit("msg-recieve", { msg: data.msg, from: data.from });
    }
  });

  socket.on("disconnect", async () => {
    try {
      onlineUsers.delete(UserId)
      socket.broadcast.emit("offline-user", UserId);
      await User.findOneAndUpdate(
        { _id: UserId },
        { $set: { isOnline: false } }
      );
    } catch (err) {
      console.log(err.message);
    }
  });
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", userRoutes);
server.listen(process.env.PORT, () => {
  console.log("listening on port", process.env.PORT);
});
