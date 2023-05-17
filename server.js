require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const mongoose = require("mongoose");
const { Room1, Room2, Room3, Room4 } = require("./models/chats");

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "Chatbot";

const PORT = 3000 || process.env.PORT;

//connect to database and then server starts listening
const dbURI = process.env.dbURI;

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) =>
    server.listen(PORT, () =>
      console.log(`Server is listening on PORT ${PORT}`)
    )
  )
  .catch((err) => console.log(err));

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//when client connects (connection keyword is reserved)
io.on("connection", (socket) => {
  //insert user into user array and identify his room
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    const Room = findRoomModel(user.room);

    //send all previous messages to the the new user joined
    Room.find()
      .then((result) => {
        socket.emit("allMessages", result);
      })
      .catch((err) => console.log(err));

    //notification to all users that someone joined and store message in database
    let formatMsg = formatMessage(botName, `${username} has joined the chat`);
    let msg = new Room(formatMsg);
    setTimeout(saveMessage, 500, msg);

    io.to(user.room).emit("message", formatMsg);

    //send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //server receives message from user and broadcast to all users and also store the messages in database
  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id);
    const Room = findRoomModel(user.room);
    let formatMsg = formatMessage(user.username, message);
    let msg = new Room(formatMsg);
    saveMessage(msg);
    io.to(user.room).emit("message", formatMsg);
  });

  //when user leaves the chatroom (disconnect keyword is reserved)
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      //inform others that user has left the chat and store in the database
      let formatMsg = formatMessage(
        botName,
        `${user.username} has left the chat room`
      );
      const Room = findRoomModel(user.room);
      let msg = new Room(formatMsg);
      saveMessage(msg);
      io.to(user.room).emit("message", formatMsg);

      //send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

//function to select the correct Room model to interact with database
function findRoomModel(room) {
  if (room === "Room1") return Room1;
  else if (room === "Room2") return Room2;
  else if (room === "Room3") return Room3;
  else if (room === "Room4") return Room4;
}

function saveMessage(msg) {
  msg
    .save()
    .then((result) => {
      //console.log(result);
    })
    .catch((err) => console.log(err));
}
