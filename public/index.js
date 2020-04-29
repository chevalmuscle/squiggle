var words = ["cat", "orange", "fish", "bulldozer"];
var turnLength = 30;
var socket = io.connect();

socket.on("new-room-id", newRoomid);

window.onload = function() {
  self = this;
  $("select#turn-lengths").change(function() {
    self.turnLength = parseInt(
      $(this)
        .children("option:selected")
        .val(),
    );
  });

  updateWordListElement();

  $("#create-room-button").click(function() {
    const gameData = { words: self.words, turnLength: self.turnLength };
    socket.emit("request-new-room", gameData);
  });

  $("#add-word-button").click(function(e) {
    const newWord = $("#add-word-input").val();
    self.words.push(newWord);
    $("#add-word-input").val("");

    updateWordListElement();
    return false;
  });

  $(document).on("click", ".remove-element", function(e) {
    const entry = $(this).parent();
    entry.remove();
    const word = $(this)
      .parent()
      .children("span:first")
      .text();
    self.words.splice(self.words.indexOf(word), 1);
  });
};

function updateWordListElement() {
  $("#word-list").empty();
  words.forEach(word => {
    $("#word-list").append(
      `<li class="word"><button type='button' class='remove-element'>X</button><span>${word}</span></li>`,
    );
  });
}

function newRoomid(roomid) {
  window.location.href = `/game?room=${roomid}`;
}
