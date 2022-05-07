const chatbtn = document.getElementById("chat-btn");
const chatMessages = document.querySelector(".chat-messages");
const userList = document.getElementById("users");
const roomName = document.getElementById("room-name");
const leavebtn = document.getElementById("leave-btn");

//get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

//receive all previous chats stored in the database
socket.on("allMessages", (result) => {
  result.forEach((message) => {
    outputMessage(message);
  });
});

//send username and room name to the server
socket.emit("joinRoom", { username, room });

//get all the users in the current room from the server
socket.on("roomUsers", ({ room, users }) => {
  roomName.innerText = room;
  let text = "";
  for (user of users) {
    text += `<li>${user.username}</li>`;
  }
  console.log(text);
  userList.innerHTML = text;
});

//receive messages (object containing username, text and time) from server
socket.on("message", (message) => {
  setTimeout(outputMessage, 500, message);
});

//on clicking the send button in the chat
chatbtn.addEventListener("click", (e) => {
  e.preventDefault();
  const msgelement = document.getElementById("msg");
  let msg = msgelement.value;
  msg = msg.trim();
  if (!msg) return false;

  //send the message to be sent to the server
  socket.emit("chatMessage", msg);
  msgelement.value = "";
  msgelement.focus();
});

//take the message object and display them in the chat window
function outputMessage(message) {
  const username = message.username;
  const text = message.text;
  const time = message.time;
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${username}<span>${time}</span></p>
    <p>${text}</p>`;
  document.querySelector(".chat-messages").appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

//Prompt the user before leave chat room
leavebtn.addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../index.html";
  } else {
  }
});
