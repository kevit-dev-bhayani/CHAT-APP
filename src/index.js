const express = require("express");
const http = require("http");
const path = require("path");
const Filter = require("bad-words");
const socketio = require("socket.io");
const { generateMessage } = require("./utils/messages");
const { generateLocationMessage } = require("./utils/location_message");

const logger=require('../logger')


const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New socket.io connection!");

  socket.on("join", (options, callback) => {
    const { user, error } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Admin","welcome"));

    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(`${user.username} has joined!`));
      logger.warn(`${user.username} joined room ${user.room}`)

    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    })
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    const user=getUser(socket.id)

    if (filter.isProfane(message)) {
      logger.warn(`${user.username} just abused in room ${user.room} :${message}`)
      return callback("No bad-words allowed");
    }

    logger.info(`${user.username} : ${message} in room :${user.room}`)
    io.to(user.room).emit("message", generateMessage(user.username,message));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    
    const user=getUser(socket.id)


    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    ),
      callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      logger.warn(`${user.username} just left room ${user.room}`)      
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left ${user.room}`)
      );
      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    })
    }
  });
});

server.listen(port, () => {
  console.log(`listing on port : ${port}`);
});
