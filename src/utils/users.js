const users = [];

//add ,remove,get user in room

const addUser = ({ id, username, room }) => {
  //clean the data

  // username = username.trim().toLowerCase();
  username=username.trim().toLowerCase()
  room = room.trim().toLowerCase();

  //validating the data
  if (!username || !room) {
    return {
      error: "User and room are require",undefined
    };
  }

  //checking existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return {
      error: "Username already taken",undefined
    };
  }

  //store user
  const user = { id, username, room };
  users.push(user);
//   console.log(user)
  return {undefined,user};
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  // console.log(index)
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  if (!user) {
    return {
      error: "no user found",
    };
  }
  return user;
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
