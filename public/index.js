var socket = io.connect();

socket.on("new-room-id", newRoomid);

window.onload = function() {
  $("#create-room-button").click(function() {
    socket.emit("request-new-room");
  });
};

function newRoomid(roomid) {
  window.location.href = `/game?room=${roomid}`;
}
