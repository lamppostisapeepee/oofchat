var socket = io();
/**
 * @type {String}
 */
var nickname;
var msgStyle = false;
/**
 * Set self nickname, can only be used once per session.
 * @param {String} nick 
 */
function setNickname(nick) {
    if (nickname) throw new Error("Nickname can only be set once!");
    socket.emit("nickname", nick);
    nickname = nick
}
socket.on('disconnect reason', reason => {
    socket.on('disconnect', () => {
        document.write("Disconnected, reason: "+reason);
    });
});

socket.on('chat message', msg => {
    const date = moment().format("(hh:mm:ss)");
    $(".messages").append(`<p class="message message${msgStyle?"A":"B"}">${date} <strong>${msg.author} </strong>${msg.content}</p>`);
    msgStyle = !msgStyle;
});

$(document).ready(() => {

// Message sending
$("#msgForm").submit(e => {
    e.preventDefault();
    const content = $("#msgContent").val();
    if (content.split(" ").join("") == "") return;
    socket.emit("chat message", content);
    $("#msgContent").val("");
});

});
